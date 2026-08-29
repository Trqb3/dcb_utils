import { DatabaseDriver, NormalizedResult } from './DatabaseDriver';
export interface MySQLDriverOptions {
    host: string;
    user: string;
    port: number;
    password: string | undefined;
}
export default class MySQLDriver implements DatabaseDriver {
    private connection;
    private options;
    private currentDatabase;
    isConnected: boolean;
    constructor(options: MySQLDriverOptions);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(sql: string, values?: any[], database?: string): Promise<NormalizedResult>;
}
