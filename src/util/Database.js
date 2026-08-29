"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = require("mysql2/promise");
/**
 * Everything needed to interact with a MySQL database but simplified.
 * */
class Database {
    host;
    user;
    port;
    _ready;
    _connection;
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
    constructor(options) {
        this.host = String(options.host);
        this.user = String(options.user);
        this.port = Number(options.port);
        this._ready = false;
    }
    /**
     * Basic request to check if the database connection is ready.
     * @returns Whether the database is ready.
     * */
    get ready() {
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
    async login(password) {
        try {
            this._connection = await (0, promise_1.createConnection)({
                host: this.host,
                user: this.user,
                port: this.port,
                password: String(password)
            });
            this._ready = true;
        }
        catch (error) {
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
    async disconnect() {
        if (!this._ready)
            throw new Error('Database not ready');
        if (!this._connection)
            throw new Error('Connection not established');
        try {
            await this._connection.end();
            this._ready = false;
        }
        catch (error) {
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
    async query(database, sql, values) {
        if (!this._ready)
            throw new Error('Database not ready');
        if (!this._connection)
            throw new Error('Connection not established');
        try {
            await this._connection.query(`USE \`${database}\``);
            const [rows] = await this._connection.query(sql, values);
            return rows;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = Database;
