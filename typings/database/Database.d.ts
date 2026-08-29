import { MySQLDriverOptions } from './drivers/mysql';
import { PostgresDriverOptions } from './drivers/postgresql';
import { SQLiteDriverOptions } from './drivers/sqlite';
export type DatabaseDialect = 'mysql' | 'postgres' | 'sqlite';
/**
 * Options für die Database-Klasse, je nach `dialect` unterschiedlich.
 * */
export type DatabaseOptions = ({
    dialect: 'mysql';
} & Omit<MySQLDriverOptions, 'password'> & {
    password?: string;
}) | ({
    dialect: 'postgres';
} & Omit<PostgresDriverOptions, 'password'> & {
    password?: string;
}) | ({
    dialect: 'sqlite';
} & SQLiteDriverOptions);
/**
 * Everything needed to interact with a database, egal ob MySQL, Postgres oder SQLite.
 * */
export default class Database<Ready extends boolean = boolean> {
    private readonly driver;
    _ready: Ready;
    /**
     * @example
     * const db = new Database({ dialect: 'mysql', host: 'localhost', user: 'root', port: 3306 });
     * const db = new Database({ dialect: 'postgres', host: 'localhost', user: 'postgres', port: 5432, database: 'mydb' });
     * const db = new Database({ dialect: 'sqlite', file: './data.db' });
     * */
    constructor(options: DatabaseOptions);
    get ready(): Ready;
    /**
     * Establishes a connection to the database.
     * Bei MySQL/Postgres kann hier optional nachträglich ein Passwort gesetzt werden,
     * ansonsten reicht ein simples `await db.login()`.
     * */
    login(): Promise<void>;
    disconnect(): Promise<void>;
    /**
     * Function to query some sql within the connected database.
     * SQL verwendet immer `?` als Platzhalter, egal welcher Dialekt darunter liegt.
     * @param sql The sql to query.
     * @param values The values to replace in the sql.
     * @param database Nur relevant bei MySQL (führt intern ein `USE` aus). Bei Postgres/SQLite ignoriert.
     * @example
     * const rows = await db.query('SELECT * FROM table WHERE id = ?', [1]);
     * */
    query(sql: string, values?: any[], database?: string): Promise<any[]>;
}
