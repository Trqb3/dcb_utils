export = Database;
/**
 * Basis Klasse für das Aufbauen von Datenbank verbindungen
 * */
declare class Database {
    /**
     * @param {DatabaseOptions} options Konfiguration's Optionen für die Datenbank Verbindung
     * */
    constructor(options: DatabaseOptions);
    databases: any;
    host: any;
    user: any;
    _ready: boolean;
    password: string | null | undefined;
    port: any;
    /**
     * Verbindet sich mit der Datenbank
     * @param {string} password Passwort für den Datenbank login
     * @returns {Promise<mysql.Connection>} Verbindung zur Datenbank
     * @example
     * db.login('mein super sicheres passwort');
     * */
    login(password: string): Promise<mysql.Connection>;
    connection: mysql.Connection | undefined;
    disconnect(): Promise<void>;
    query(database: any, sql: any): Promise<mysql.QueryResult>;
}
import mysql = require("mysql2/promise");
