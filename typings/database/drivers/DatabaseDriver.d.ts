/**
 * Normalisiertes Query-Ergebnis, unabhängig vom DB-Treiber.
 * */
export interface NormalizedResult {
    rows: any[];
    rowCount: number;
}
/**
 * Gemeinsames Interface, das jeder DB-Adapter (MySQL, Postgres, SQLite) implementieren muss.
 * Die Database-Klasse redet nur noch mit diesem Interface, nie direkt mit einer DB-Lib.
 * */
export interface DatabaseDriver {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    /**
     * Führt eine Query aus. `sql` verwendet IMMER `?` als Platzhalter,
     * unabhängig vom darunterliegenden Treiber (der Adapter rechnet das intern um).
     * `database` ist optional, da Postgres/SQLite das Konzept "USE db" nicht kennen.
     * */
    query(sql: string, values?: any[], database?: string): Promise<NormalizedResult>;
    readonly isConnected: boolean;
}
