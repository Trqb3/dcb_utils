import { existsSync, mkdirSync, appendFileSync, openSync, fsyncSync, closeSync } from 'fs';
import { join } from 'path';
/**
 * Creates a new instance of the Logger class.
 * @param dir The directory to store the log files.
 * @param options Optional configuration options for the logger.
 * @example
 * const logger = new Logger('./logs');
 * const prodLogger = new Logger('./logs', { minLevel: LogLevel.Warn })
 * */
export default class Logger {
    dir;
    levels;
    minLevel;
    _ready;
    filePath;
    currentDate;
    constructor(dir, options = {}) {
        this.dir = dir;
        this.levels = new Map().set(0, 'DEBUG').set(1, 'INFO').set(2, 'WARN').set(3, 'ERROR');
        this.minLevel = options.minLevel ?? 1 /* LogLevel.Info */;
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
    /**
     * Sets the minimum log level at runtime
     * @param level The new minimum log level to set
     * @example
     * logger.setMinLevel(LogLevel.Error);
     */
    setMinLevel(level) {
        if (!this.levels.has(level))
            throw new Error('Invalid log level');
        this.minLevel = level;
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
    formatDetails(details) {
        if (details === undefined || details === null || details === '')
            return '';
        if (details instanceof Error)
            return details.stack ?? details.message;
        if (typeof details === 'string')
            return details;
        try {
            return JSON.stringify(details);
        }
        catch {
            return String(details);
        }
    }
    /**
     * Append messages to the before created log file.
     * Messages with a level below the minimum will be ignored.
     * @example
     * logger.write(0, 'This is a debug message');
     * logger.write(LogLevel.Debug, 'This is a debug message')
     * */
    write(level, message, details) {
        if (!this._ready)
            throw new Error('Logger not ready');
        const logLevel = this.levels.get(level);
        if (!logLevel)
            throw new Error('Invalid log level');
        if (level < this.minLevel)
            return;
        this.updateFilePath();
        const timestamp = new Date().toISOString();
        const detailText = this.formatDetails(details);
        const logMessage = `${timestamp} - [${logLevel}] - ${message}${detailText ? ` - (${detailText})` : ''}`;
        const fd = openSync(this.filePath, 'a');
        try {
            appendFileSync(fd, `${logMessage}\n`, 'utf-8');
            fsyncSync(fd);
        }
        finally {
            closeSync(fd);
        }
        console.log(logMessage);
    }
    /**
     * Shortcut for {@link Logger.write} with {@link LogLevel.Info}
     * */
    info(message, details) {
        this.write(1 /* LogLevel.Info */, message, details);
    }
    /**
     * Shortcut for {@link Logger.write} with {@link LogLevel.Warn}
     * */
    warn(message, details) {
        this.write(2 /* LogLevel.Warn */, message, details);
    }
    /**
     * Shortcut for {@link Logger.write} with {@link LogLevel.Error}
     * */
    error(message, details) {
        this.write(3 /* LogLevel.Error */, message, details);
    }
    /**
     * Shortcut for {@link Logger.write} with {@link LogLevel.Debug}
     * */
    debug(message, details) {
        this.write(0 /* LogLevel.Debug */, message, details);
    }
}
