'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mysql = require('mysql2/promise');
const Options = require('../util/Options');
const { DcbError, DcbTypeError } = require('../errors/DcbError');
const ErrorCodes = require('../errors/ErrorCodes');
/**
 * Basis Klasse für das Aufbauen von Datenbank verbindungen
 * */
class Database {
    /**
     * @param {DatabaseOptions} options Konfiguration's Optionen für die Datenbank Verbindung
     * */
    constructor(options) {
        if (!options)
            throw new DcbError(ErrorCodes.MissingArgument, 'options');
        if (typeof options !== 'object')
            throw new DcbTypeError(ErrorCodes.InvalidType, 'options', 'object');
        this.host = options.host;
        this.user = options.user;
        this._ready = false;
        Object.defineProperty(this, 'password', { writable: true });
        if (!this.password && 'DATABASE_PASSWORD' in process.env) {
            this.password = process.env.DATABASE_PASSWORD;
        }
        else {
            this.password = null;
        }
        this.port = options.port;
    }
    /**
     * Verbindet sich mit der Datenbank
     * @param {string} password Passwort für den Datenbank login
     * @returns {Promise<mysql.Connection>} Verbindung zur Datenbank
     * @example
     * db.login('mein super sicheres passwort');
     * */
    login(password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.host)
                throw new DcbError(ErrorCodes.MissingArgument, 'host');
            if (typeof this.host !== 'string')
                throw new DcbTypeError(ErrorCodes.InvalidType, 'host', 'string');
            if (!this.user)
                throw new DcbError(ErrorCodes.MissingArgument, 'user', 'string');
            if (typeof this.user !== 'string')
                throw new DcbTypeError(ErrorCodes.InvalidType, 'user', 'string');
            if (!password)
                throw new DcbError(ErrorCodes.MissingArgument, 'password');
            if (typeof password !== 'string')
                throw new DcbTypeError(ErrorCodes.InvalidType, 'password', 'string');
            if (!this.port)
                throw new DcbError(ErrorCodes.MissingArgument, 'port');
            if (typeof this.port !== 'number')
                throw new DcbTypeError(ErrorCodes.InvalidType, 'port', 'number');
            try {
                this.connection = yield mysql.createConnection({
                    host: this.host,
                    user: this.user,
                    password,
                    port: this.port,
                });
                this._ready = true;
            }
            catch (error) {
                throw error;
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connection) {
                yield this.connection.end();
                this._ready = false;
            }
        });
    }
    query(database, sql) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._ready)
                throw new DcbError(ErrorCodes.NotReady);
            if (!database)
                throw new DcbError(ErrorCodes.MissingArgument, 'database');
            if (typeof database !== 'string')
                throw new DcbTypeError(ErrorCodes.InvalidType, 'database', 'string');
            if (!sql)
                throw new DcbError(ErrorCodes.MissingArgument, 'sql');
            if (typeof sql !== 'string')
                throw new DcbTypeError(ErrorCodes.InvalidType, 'sql', 'string');
            try {
                yield this.connection.query(`USE \`${database}\``);
                const [rows] = yield this.connection.query(sql);
                return rows;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
module.exports = Database;
