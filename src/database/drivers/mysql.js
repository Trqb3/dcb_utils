"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = require("mysql2/promise");
class MySQLDriver {
    connection;
    options;
    currentDatabase;
    isConnected = false;
    constructor(options) {
        this.options = options;
    }
    async connect() {
        this.connection = await (0, promise_1.createConnection)({
            host: this.options.host,
            user: this.options.user,
            port: this.options.port,
            password: this.options.password
        });
        this.isConnected = true;
    }
    async disconnect() {
        if (!this.connection)
            throw new Error('Connection not established');
        await this.connection.end();
        this.isConnected = false;
    }
    async query(sql, values = [], database) {
        if (!this.connection)
            throw new Error('Connection not established');
        if (database && database !== this.currentDatabase) {
            await this.connection.query(`USE \`${database}\``);
            this.currentDatabase = database;
        }
        const [rows] = await this.connection.query(sql, values);
        const rowsArray = Array.isArray(rows) ? rows : [];
        return { rows: rowsArray, rowCount: rowsArray.length };
    }
}
exports.default = MySQLDriver;
