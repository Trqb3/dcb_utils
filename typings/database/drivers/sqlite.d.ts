import { DatabaseDriver, NormalizedResult } from './DatabaseDriver';
export interface SQLiteDriverOptions {
    file: string;
}
export default class SQLiteDriver implements DatabaseDriver {
    private db;
    private options;
    isConnected: boolean;
    constructor(options: SQLiteDriverOptions);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(sql: string, values?: any[], _database?: string): Promise<NormalizedResult>;
}
