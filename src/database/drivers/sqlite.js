"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
class SQLiteDriver {
    db;
    options;
    isConnected = false;
    constructor(options) {
        this.options = options;
    }
    async connect() {
        this.db = new better_sqlite3_1.default(this.options.file);
        this.isConnected = true;
    }
    async disconnect() {
        if (!this.db)
            throw new Error('Connection not established');
        this.db.close();
        this.isConnected = false;
    }
    async query(sql, values = [], _database) {
        if (!this.db)
            throw new Error('Connection not established');
        const stmt = this.db.prepare(sql);
        const isSelect = /^\s*select/i.test(sql);
        if (isSelect) {
            const rows = stmt.all(...values);
            return { rows, rowCount: rows.length };
        }
        else {
            const info = stmt.run(...values);
            return { rows: [], rowCount: info.changes };
        }
    }
}
exports.default = SQLiteDriver;
