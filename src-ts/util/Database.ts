import { Connection, QueryResult, createConnection } from 'mysql2/promise';

/**
 * Options for the Database class.
 * */
export interface DatabaseOptions {
    host: string;
    user: string;
    port: string | number;
}

/**
 * Everything needed to interact with a MySQL database but simplified.
 * */
export default class Database<Ready extends boolean = boolean> {
    private readonly host: string;
    private readonly user: string;
    private readonly port: number;
    public _ready: Ready;
    public _connection: Connection | undefined;

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
    constructor(options: DatabaseOptions) {
        this.host = options.host;
        this.user = options.user;
        this.port = Number(options.port);
        this._ready = false as Ready;
    }

    /**
     * Basic request to check if the database connection is ready.
     * @returns Whether the database is ready.
     * */
    public get ready(): Ready {
        return this._ready;
    }

    /**
     * Establishes a connection to the database.
     * @param password The password to connect to the database.
     * @example
     * await db.login('password');
     * @see {@link Database.constructor Database initialization}
     * @see {@link Database.login Database login}
     * @returns Promise<void>
     * */
    public async login(password: string): Promise<void> {
        try {
            this._connection = await createConnection({
                host: this.host,
                user: this.user,
                port: this.port,
                password
            });

            this._ready = true as Ready;
        } catch (error) {
            throw error;
        }
    }

    /**
     * If a connection is already established, it will be closed within this function.
     * @example
     * await db.disconnect();
     * @see {@link Database.constructor Database initialization}
     * @see {@link Database.login Database login}
     * @returns Promise<void>
     * */
    public async disconnect(): Promise<void> {
        if (!this._ready) throw new Error('Database not ready');
        if (!this._connection) throw new Error('Connection not established');

        try {
            await this._connection.end();
            this._ready = false as Ready;
        } catch (error) {
            throw error;
        }
    }

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
    public async query(database: string, sql: string, values?: any[]): Promise<QueryResult> {
        if (!this._ready) throw new Error('Database not ready');
        if (!this._connection) throw new Error('Connection not established');

        try {
            await this._connection.query(`USE \`${database}\``);
            const [rows] = await this._connection.query(sql, values);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}