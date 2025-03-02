'use strict';
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Logger_instances, _Logger_init;
const fs = require('fs');
const path = require('path');
const DcbError = require("../errors/DcbError");
const ErrorCodes = require("../errors/ErrorCodes");
class Logger {
    /**
     * Erstellt einen neuen Logger
     * @param {string} dir Ort an welchem die Log-Dateien gespeichert werden sollen
     * */
    constructor(dir) {
        _Logger_instances.add(this);
        this.dir = dir;
        this._filePath = '';
        this._ready = false;
        __classPrivateFieldGet(this, _Logger_instances, "m", _Logger_init).call(this, this.dir);
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
        if (!this._ready)
            throw new DcbError(ErrorCodes.NotReady, 'Logger not ready');
        try {
            const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
            const timestamp = new Date().toISOString();
            const logLevel = levels[level] || 'UNKNOWN';
            const logMessage = `${timestamp} - [${logLevel}] - ${message} ${details ? `(${details})` : ''}`;
            fs.appendFileSync(this._filePath, `${logMessage}\n`, 'utf8');
            console.log(logMessage);
        }
        catch (error) {
            throw new DcbError(ErrorCodes.NotReady, error);
        }
    }
}
_Logger_instances = new WeakSet(), _Logger_init = function _Logger_init(dir) {
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir);
    const fileName = `${new Date().toISOString().replace(/:/g, '-')}.log`;
    this._filePath = path.join(dir, fileName);
    fs.writeFileSync(this._filePath, '');
    this._ready = true;
};
module.exports = Logger;
