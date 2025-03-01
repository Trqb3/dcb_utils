'use strict';

const fs = require('fs');
const path = require('path');
const { DcbError, ErrorCodes } = require("../index");

class Logger {
    /**
     * Erstellt einen neuen Logger
     * @param {string} dir Ort an welchem die Log-Dateien gespeichert werden sollen
     * */
    constructor(dir) {
        this.dir = dir;
        this._filePath = '';
        this._ready = false;

        this.#init(this.dir);
    }

    /**
     * Initialisiert den Logger
     * @param {string} dir Ort an welchem die Log-Dateien gespeichert werden sollen
     * @returns {void}
     * */
    #init(dir) {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);

        const fileName = `${new Date().toISOString().replace(/:/g,'-')}.log`;
        this._filePath = path.join(dir, fileName);

        fs.writeFileSync(this._filePath, '');
        this._ready = true;
    }

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
    write(level, message, details = undefined) {
        if (!this._ready) throw new DcbError(ErrorCodes.NotReady, 'Logger not ready');

        try {
            const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
            const timestamp = new Date().toISOString();
            const logLevel = levels[level] || 'UNKNOWN';
            const logMessage = `${timestamp} - [${logLevel}] - ${message} ${details ? `(${details})` : ''}`;

            fs.appendFileSync(this._filePath, `${logMessage}\n`, 'utf8');
            console.log(logMessage);
        } catch (error) {
            throw new DcbError(ErrorCodes.NotReady, error);
        }
    }
}

module.exports = Logger;