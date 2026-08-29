"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
class PostgresDriver {
    client;
    options;
    isConnected = false;
    constructor(options) {
        this.options = options;
    }
    async connect() {
        this.client = new pg_1.Client({
            host: this.options.host,
            user: this.options.user,
            port: this.options.port,
            password: this.options.password,
            database: this.options.database
        });
        await this.client.connect();
        this.isConnected = true;
    }
    async disconnect() {
        if (!this.client)
            throw new Error('Connection not established');
        await this.client.end();
        this.isConnected = false;
    }
    /**
     * Wandelt `?`-Platzhalter in `$1, $2, ...` um, damit man überall die gleiche
     * SQL-Syntax schreiben kann.
     * */
    convertPlaceholders(sql) {
        let i = 0;
        return sql.replace(/\?/g, () => `$${++i}`);
    }
    async query(sql, values = [], _database) {
        if (!this.client)
            throw new Error('Connection not established');
        const converted = this.convertPlaceholders(sql);
        const result = await this.client.query(converted, values);
        return { rows: result.rows, rowCount: result.rowCount ?? result.rows.length };
    }
}
exports.default = PostgresDriver;
