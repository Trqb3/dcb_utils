import { QueryResultRow } from 'pg';
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
/**
 * Everything needed to interact with a PostgreSQL database but simplified.
 * */
export default class DatabaseConnection {
    private readonly options;
    private pool;
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
    constructor(options: DatabaseOptions);
    /**
     * Whether the database connection is initialized and ready to use.
     * @returns boolean
     * */
    get ready(): boolean;
    private static readonly RETRYABLE_CODES;
    private static readonly RETRYABLE_MESSAGES;
    private static isRetryable;
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
    connect(password: string, maxRetries?: number): Promise<void>;
    private wrapConnectError;
    /**
     * If a connection is already established, it will be closed within this function.
     * @example
     * await db.disconnect();
     * @see {@link DatabaseConnection.constructor Database initialization}
     * @see {@link DatabaseConnection.connect Database connection}
     * @returns Promise<void>
     * */
    disconnect(): Promise<void>;
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
    query<T extends QueryResultRow = QueryResultRow>(sql: string, values?: unknown[], timeout?: number): Promise<T[]>;
    /**
     * Like {@link DatabaseConnection.query}, but returns the number of affected rows.
     * Meant for INSERT / UPDATE / DELETE (replacement for MySQL's `affectedRows`).
     * @example
     * const affected = await db.execute('DELETE FROM user_levels WHERE guild_id = $1', ['123']);
     * @returns Number of affected rows.
     * */
    execute(sql: string, values?: unknown[], timeout?: number): Promise<number>;
    private run;
}
