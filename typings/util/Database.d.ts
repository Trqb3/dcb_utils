import { Connection, QueryResult } from 'mysql2/promise';
/**
 * Options for the Database class.
 * */
export interface DatabaseOptions {
    host: string | undefined;
    user: string | undefined;
    port: string | number | undefined;
}
/**
 * Everything needed to interact with a MySQL database but simplified.
 * */
export default class Database<Ready extends boolean = boolean> {
    private readonly host;
    private readonly user;
    private readonly port;
    _ready: Ready;
    _connection: Connection | undefined;
    /**
     * Creates a new instance of the Database class.
     * @param options The options to connect to the database.
     * @example
     * const db = new Database({
     *     host: 'localhost',
     *     user: 'root',
     *     port: 3306,
     * });
     * */
    constructor(options: DatabaseOptions);
    /**
     * Basic request to check if the database connection is ready.
     * @returns Whether the database is ready.
     * */
    get ready(): Ready;
    /**
     * Establishes a connection to the database.
     * @param password The password to connect to the database.
     * @example
     * await db.login('password');
     * @see {@link Database.constructor Database initialization}
     * @see {@link Database.login Database login}
     * @returns Promise<void>
     * */
    login(password: string | undefined): Promise<void>;
    /**
     * If a connection is already established, it will be closed within this function.
     * @example
     * await db.disconnect();
     * @see {@link Database.constructor Database initialization}
     * @see {@link Database.login Database login}
     * @returns Promise<void>
     * */
    disconnect(): Promise<void>;
    /**
     * Function to query some sql within the connected database.
     * @param database The database to query.
     * @param sql The sql to query.
     * @param values The values to replace in the sql.
     * @example
     * await db.query('database_name', 'SELECT * FROM table WHERE id = ?', [1]);
     *
     * const result = await db.query('database_name', 'SELECT * FROM table WHERE id = ?', [1]) as RowDataPacket[];
     * @see {@link Database.constructor Database initialization}
     * @returns The result of sql query.
     * */
    query(database: string, sql: string, values?: any[]): Promise<QueryResult>;
}
