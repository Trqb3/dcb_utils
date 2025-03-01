export = Logger;
declare class Logger {
    /**
     * Erstellt einen neuen Logger
     * @param {string} dir Ort an welchem die Log-Dateien gespeichert werden sollen
     * */
    constructor(dir: string);
    dir: string;
    _filePath: string;
    _ready: boolean;
    /**
     * Schreibt eine Nachricht in die Logdatei und die Konsole. Funktioniert nur, wenn der Logger bereit ist.
     * ___
     * @loglevel 0 = INFO
     * @loglevel 1 = WARN
     * @loglevel 2 = ERROR
     * @loglevel 3 = DEBUG
     * @param {number} level Log-Level
     * @param {string} message Nachricht welche geloggt werden soll
     * @param {string} details Details zur Nachricht
     * @returns {void}
     * @example
     * logger.write(0, 'Hello World', 'This is a test');
     * */
    write(level: number, message: string, details?: string): void;
    #private;
}
