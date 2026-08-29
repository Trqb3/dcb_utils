import { DatabaseDriver, NormalizedResult } from './DatabaseDriver';
export interface PostgresDriverOptions {
    host: string;
    user: string;
    port: number;
    password: string | undefined;
    database: string;
}
export default class PostgresDriver implements DatabaseDriver {
    private client;
    private options;
    isConnected: boolean;
    constructor(options: PostgresDriverOptions);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    /**
     * Wandelt `?`-Platzhalter in `$1, $2, ...` um, damit man überall die gleiche
     * SQL-Syntax schreiben kann.
     * */
    private convertPlaceholders;
    query(sql: string, values?: any[], _database?: string): Promise<NormalizedResult>;
}
