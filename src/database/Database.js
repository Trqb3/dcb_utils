"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("./drivers/mysql"));
const postgresql_1 = __importDefault(require("./drivers/postgresql"));
const sqlite_1 = __importDefault(require("./drivers/sqlite"));
/**
 * Everything needed to interact with a database, egal ob MySQL, Postgres oder SQLite.
 * */
class Database {
    driver;
    _ready;
    /**
     * @example
     * const db = new Database({ dialect: 'mysql', host: 'localhost', user: 'root', port: 3306 });
     * const db = new Database({ dialect: 'postgres', host: 'localhost', user: 'postgres', port: 5432, database: 'mydb' });
     * const db = new Database({ dialect: 'sqlite', file: './data.db' });
     * */
    constructor(options) {
        switch (options.dialect) {
            case 'mysql':
                this.driver = new mysql_1.default({
                    host: String(options.host),
                    user: String(options.user),
                    port: Number(options.port),
                    password: options.password
                });
                break;
            case 'postgres':
                this.driver = new postgresql_1.default({
                    host: String(options.host),
                    user: String(options.user),
                    port: Number(options.port),
                    password: options.password,
                    database: String(options.database)
                });
                break;
            case 'sqlite':
                this.driver = new sqlite_1.default({ file: options.file });
                break;
            default:
                throw new Error(`Unsupported dialect: ${options.dialect}`);
        }
        this._ready = false;
    }
    get ready() {
        return this._ready;
    }
    /**
     * Establishes a connection to the database.
     * Bei MySQL/Postgres kann hier optional nachträglich ein Passwort gesetzt werden,
     * ansonsten reicht ein simples `await db.login()`.
     * */
    async login() {
        try {
            await this.driver.connect();
            this._ready = true;
        }
        catch (error) {
            throw error;
        }
    }
    async disconnect() {
        if (!this._ready)
            throw new Error('Database not ready');
        try {
            await this.driver.disconnect();
            this._ready = false;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Function to query some sql within the connected database.
     * SQL verwendet immer `?` als Platzhalter, egal welcher Dialekt darunter liegt.
     * @param sql The sql to query.
     * @param values The values to replace in the sql.
     * @param database Nur relevant bei MySQL (führt intern ein `USE` aus). Bei Postgres/SQLite ignoriert.
     * @example
     * const rows = await db.query('SELECT * FROM table WHERE id = ?', [1]);
     * */
    async query(sql, values, database) {
        if (!this._ready)
            throw new Error('Database not ready');
        try {
            const result = await this.driver.query(sql, values, database);
            return result.rows;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = Database;
