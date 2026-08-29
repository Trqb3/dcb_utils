"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
class Logger {
    dir;
    levels;
    _ready;
    filePath;
    currentDate;
    /**
     * Creates a new instance of the Logger class.
     * @param dir The directory to store the log files.
     * @example
     * const logger = new Logger('./logs');
     * */
    constructor(dir) {
        this.dir = dir;
        this.levels = new Map().set(0, 'INFO').set(1, 'WARN').set(2, 'ERROR').set(3, 'DEBUG');
        this._ready = false;
        this.filePath = '';
        this.currentDate = '';
    }
    /**
     * Basic request to check if the database connection is ready.
     * @returns Whether the database is ready.
     * */
    get ready() {
        return this._ready;
    }
    /**
     * Initializes the logger by creating the log file.
     * @example
     * logger.init();
     * */
    init() {
        if (!(0, fs_1.existsSync)(this.dir))
            (0, fs_1.mkdirSync)(this.dir);
        this.updateFilePath();
        this._ready = true;
    }
    updateFilePath() {
        const newDate = new Date().toISOString().split('T')[0];
        if (this.currentDate !== newDate) {
            this.currentDate = newDate;
            const fileName = `${this.currentDate}.log`;
            this.filePath = (0, path_1.join)(this.dir, fileName);
            if (!(0, fs_1.existsSync)(this.filePath)) {
                const fd = (0, fs_1.openSync)(this.filePath, 'w');
                (0, fs_1.closeSync)(fd);
            }
        }
    }
    /**
     * Append messages to the before created log file.
     * @example
     * logger.write(0, 'This is an info message');
     * */
    write(level, message, details) {
        if (!this._ready)
            throw new Error('Logger not ready');
        try {
            this.updateFilePath();
            const timestamp = new Date().toISOString();
            const logLevel = this.levels.get(level);
            if (!logLevel)
                throw new Error('Invalid log level');
            const logMessage = `${timestamp} - [${logLevel}] - ${message} ${details ? `- (${details})` : ''}`;
            const fd = (0, fs_1.openSync)(this.filePath, 'a');
            (0, fs_1.appendFileSync)(fd, `${logMessage}\n`, 'utf-8');
            (0, fs_1.fsyncSync)(fd);
            (0, fs_1.closeSync)(fd);
            console.log(logMessage);
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = Logger;
