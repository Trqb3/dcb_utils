import { QueryResult, Pool, PoolOptions, PoolConnection, createPool } from 'mysql2/promise';
import { DcbError, DcbErrorCodes } from '../../errors/DcbError';
import { EventEmitter } from 'events';

/**
 * Options for the Database class.
 * */
export interface DatabaseOptions {
    host: string;
    user: string;
    port: number;
    database: string;
    connectionLimit?: number;
}

const DB_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

/**
 * Everything needed to interact with a MySQL database but simplified.
 * */
export default class DatabaseConnection {
    private readonly options: DatabaseOptions;
    private pool: Pool | undefined;

    /**
     * Creates a new instance of the Database class.
     * @param options The options to connect to the database.
     * @example
     * const db = new DatabaseConnection({
     *     host: 'localhost',
     *     user: 'root',
     *     port: 3306,
     *     database: 'my_database',
     * });
     * */
    constructor(options: DatabaseOptions) {
        if (!DB_NAME_PATTERN.test(options.database)) throw new DcbError(DcbErrorCodes.InvalidInput, 'Database name must only contain alphanumeric characters and underscores');
        this.options = options;
    }

    /**
     * Whether the database connection is initialized and ready to use.
     * @returns boolean
     * */
    public get ready(): boolean {
        return this.pool !== undefined;
    }



    private static readonly RETRYABLE_CODES: Set<string> = new Set([
        'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'PROTOCOL_CONNECTION_LOST', 'ECONNRESET'
    ]);

    /**
     * Establishes a connection to the database.
     * @param password The password to connect to the database.
     * @param maxRetries The maximum number of retries for connection attempts. Default is 3.
     * @example
     * await db.connect('password');
     * @see {@link DatabaseConnection.constructor Database initialization}
     * @see {@link DatabaseConnection.disconnect Database disconnection}
     * @see {@link DatabaseConnection.query Database query}
     * @see {@link DatabaseConnection.ready Database readiness}
     * @returns Promise<void>
     * */
    public async connect(password: string, maxRetries: number = 3): Promise<void> {
        if (this.pool) return;

        const poolOptions: PoolOptions = {
            host: this.options.host,
            user: this.options.user,
            port: this.options.port,
            password,
            database: this.options.database,
            connectionLimit: this.options.connectionLimit ?? 10,
            waitForConnections: true
        };

        let lastError: unknown;

        for (let attempt: number = 1; attempt <= maxRetries; attempt++) {
            const pool: Pool = createPool(poolOptions);

            try {
                const conn: PoolConnection = await pool.getConnection();
                conn.release();

                (pool as unknown as EventEmitter).on('error', (err: Error): void => {
                    console.error('MySQL pool error:', err.message);
                });

                this.pool = pool;
                return;
            } catch (error) {
                await pool.end();
                lastError = error;

                const code: string | undefined = (error as { code?: string }).code;

                if (!code || !DatabaseConnection.RETRYABLE_CODES.has(code)) throw this.wrapConnectError(error);

                if (attempt < maxRetries) {
                    const delayMs: number = 500 * 2 ** (attempt - 1);
                    await new Promise((resolve) => setTimeout(resolve, delayMs));
                }
            }
        }

        throw this.wrapConnectError(lastError);
    }

    private wrapConnectError(error: unknown): DcbError {
        const code: string | undefined = (error as { code?: string }).code;

        if (code === 'ER_ACCESS_DENIED_ERROR') return new DcbError(DcbErrorCodes.DbAuthFailed, 'Invalid credentials');
        if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ETIMEDOUT') {
            return new DcbError(DcbErrorCodes.DbConnectionFailed, `Could not reach database at ${this.options.host}:${this.options.port}`);
        }

        return new DcbError(DcbErrorCodes.DbConnectionFailed, (error as Error).message);
    }

    /**
     * If a connection is already established, it will be closed within this function.
     * @example
     * await db.disconnect();
     * @see {@link DatabaseConnection.constructor Database initialization}
     * @see {@link DatabaseConnection.connect Database connection}
     * @returns Promise<void>
     * */
    public async disconnect(): Promise<void> {
        if (!this.pool) throw new DcbError(DcbErrorCodes.DbNotReady);

        await this.pool.end();
        this.pool = undefined;
    }

    /**
     * Function to query some sql within the connected database.
     * @param sql The sql to query.
     * @param values The values to replace in the sql.
     * @param timeout The timeout for the query in milliseconds. Default is 10 seconds.
     * @example
     * await db.query('SELECT * FROM table WHERE id = ?', [1]);
     *
     * const result = await db.query('SELECT * FROM table WHERE id = ?', [1]) as RowDataPacket[];
     * @see {@link DatabaseConnection.constructor Database initialization}
     * @see {@link DatabaseConnection.connect Database connection}
     * @returns The result of sql query.
     * */
    public async query<T extends QueryResult = QueryResult>(sql: string, values?: any[], timeout: number = 10_000): Promise<T> {
        if (!this.pool) throw new DcbError(DcbErrorCodes.DbNotReady);

        const [rows] = await this.pool.query<T>({sql, values, timeout});
        return rows;
    }
}