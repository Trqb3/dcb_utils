import { existsSync, mkdirSync, appendFileSync, openSync, fsyncSync, closeSync } from 'fs';
import { join } from 'path';
/**
 * Creates a new instance of the Logger class.
 * @param dir The directory to store the log files.
 * @example
 * const logger = new Logger('./logs');
 * */
export default class Logger {
    dir;
    levels;
    _ready;
    filePath;
    currentDate;
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
        if (!existsSync(this.dir))
            mkdirSync(this.dir);
        this.updateFilePath();
        this._ready = true;
    }
    updateFilePath() {
        const newDate = new Date().toISOString().split('T')[0];
        if (this.currentDate !== newDate) {
            this.currentDate = newDate;
            const fileName = `${this.currentDate}.log`;
            this.filePath = join(this.dir, fileName);
            if (!existsSync(this.filePath)) {
                const fd = openSync(this.filePath, 'w');
                closeSync(fd);
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
            const fd = openSync(this.filePath, 'a');
            appendFileSync(fd, `${logMessage}\n`, 'utf-8');
            fsyncSync(fd);
            closeSync(fd);
            console.log(logMessage);
        }
        catch (error) {
            throw error;
        }
    }
}
