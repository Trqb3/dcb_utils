import { Pool, PoolClient, PoolConfig, QueryConfig, QueryResult, QueryResultRow } from 'pg';
import { DcbError, DcbErrorCodes } from '../../errors/DcbError';

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
 * Everything needed to interact with a PostgreSQL database but simplified.
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
     *     user: 'postgres',
     *     port: 5432,
     *     database: 'my_database',
     * });
     * */
    constructor(options: DatabaseOptions) {
        if (!DB_NAME_PATTERN.test(options.database)) throw new DcbError(DcbErrorCodes.InvalidInput, 'Database name must only contain alphanumeric characters, underscores and hyphens');
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
        'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET',
        '57P03' // cannot_connect_now (Postgres startet noch / fährt hoch)
    ]);

    // pg wirft bei Timeouts bzw. abgebrochenen Verbindungen teils Fehler ohne code
    private static readonly RETRYABLE_MESSAGES: RegExp = /timeout exceeded when trying to connect|Connection terminated/i;

    private static isRetryable(error: unknown): boolean {
        const code: string | undefined = (error as { code?: string }).code;
        if (code && DatabaseConnection.RETRYABLE_CODES.has(code)) return true;
        return DatabaseConnection.RETRYABLE_MESSAGES.test((error as Error).message ?? '');
    }

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

        const poolConfig: PoolConfig = {
            host: this.options.host,
            user: this.options.user,
            port: this.options.port,
            password,
            database: this.options.database,
            max: this.options.connectionLimit ?? 10,
            connectionTimeoutMillis: 5_000 // sonst wartet pg beim Verbindungsaufbau potenziell ewig
        };

        let lastError: unknown;

        for (let attempt: number = 1; attempt <= maxRetries; attempt++) {
            const pool: Pool = new Pool(poolConfig);

            // Idle-Clients können jederzeit einen Fehler werfen, ohne Handler crasht der Prozess
            pool.on('error', (err: Error): void => {
                console.error('PostgreSQL pool error:', err.message);
            });

            try {
                const client: PoolClient = await pool.connect();
                client.release();

                this.pool = pool;
                return;
            } catch (error) {
                await pool.end();
                lastError = error;

                if (!DatabaseConnection.isRetryable(error)) throw this.wrapConnectError(error);

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

        // 28P01 = invalid_password, 28000 = invalid_authorization_specification
        if (code === '28P01' || code === '28000') return new DcbError(DcbErrorCodes.DbAuthFailed, 'Invalid credentials');
        // 3D000 = invalid_catalog_name (Datenbank existiert nicht)
        if (code === '3D000') return new DcbError(DcbErrorCodes.DbConnectionFailed, `Database "${this.options.database}" does not exist`);
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
     * Placeholders are `$1, $2, ...` (not `?` like in MySQL).
     * @param sql The sql to query.
     * @param values The values to replace in the sql.
     * @param timeout The timeout for the query in milliseconds. Default is 10 seconds.
     * @example
     * await db.query('SELECT * FROM users WHERE id = $1', [1]);
     *
     * const rows = await db.query<{ id: string; xp: number }>('SELECT * FROM user_levels WHERE user_id = $1', ['123']);
     * @see {@link DatabaseConnection.constructor Database initialization}
     * @see {@link DatabaseConnection.connect Database connection}
     * @returns The rows of the sql query.
     * */
    public async query<T extends QueryResultRow = QueryResultRow>(sql: string, values?: unknown[], timeout: number = 10_000): Promise<T[]> {
        const result: QueryResult<T> = await this.run<T>(sql, values, timeout);
        return result.rows;
    }

    /**
     * Like {@link DatabaseConnection.query}, but returns the number of affected rows.
     * Meant for INSERT / UPDATE / DELETE (replacement for MySQL's `affectedRows`).
     * @example
     * const affected = await db.execute('DELETE FROM user_levels WHERE guild_id = $1', ['123']);
     * @returns Number of affected rows.
     * */
    public async execute(sql: string, values?: unknown[], timeout: number = 10_000): Promise<number> {
        const result: QueryResult = await this.run(sql, values, timeout);
        return result.rowCount ?? 0;
    }

    private async run<T extends QueryResultRow = QueryResultRow>(sql: string, values: unknown[] | undefined, timeout: number): Promise<QueryResult<T>> {
        if (!this.pool) throw new DcbError(DcbErrorCodes.DbNotReady);

        // query_timeout wird von pg unterstützt, fehlt aber in den @types/pg-QueryConfig
        const config: QueryConfig = { text: sql, values, query_timeout: timeout } as QueryConfig;
        return this.pool.query<T>(config);
    }
}