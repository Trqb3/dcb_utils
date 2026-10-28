import { existsSync, mkdirSync, appendFileSync, openSync, fsyncSync, closeSync } from 'fs';
import { join } from 'path';



const enum LogLevel {
    Debug = 0,
    Info = 1,
    Warn = 2,
    Error = 3
}

/**
 * Options for the Logger class.
 * @property minLevel - The minimum log level to include in the logs. Default is {@link LogLevel.Info}
 */
export interface LoggerOptions {
    minLevel?: LogLevel;
}



/**
 * Creates a new instance of the Logger class.
 * @param dir The directory to store the log files.
 * @param options Optional configuration options for the logger.
 * @example
 * const logger = new Logger('./logs');
 * const prodLogger = new Logger('./logs', { minLevel: LogLevel.Warn })
 * */
export default class Logger<Ready extends boolean = boolean> {
    public dir: string;
    public levels: Map<number, string>;
    public minLevel: LogLevel;
    public _ready: Ready;
    private filePath: string;
    private currentDate: string;

    constructor(dir: string, options: LoggerOptions = {}) {
        this.dir = dir;
        this.levels = new Map().set(0, 'DEBUG').set(1, 'INFO').set(2, 'WARN').set(3, 'ERROR');
        this.minLevel = options.minLevel ?? LogLevel.Info;
        this._ready = false as Ready;
        this.filePath = '';
        this.currentDate = '';
    }

    /**
     * Basic request to check if the database connection is ready.
     * @returns Whether the database is ready.
     * */
    public get ready(): Ready {
        return this._ready;
    }

    /**
     * Initializes the logger by creating the log file.
     * @example
     * logger.init();
     * */
    public init(): void {
        if (!existsSync(this.dir)) mkdirSync(this.dir);

        this.updateFilePath();
        this._ready = true as Ready;
    }

    /**
     * Sets the minimum log level at runtime
     * @param level The new minimum log level to set
     * @example
     * logger.setMinLevel(LogLevel.Error);
     */
    public setMinLevel(level: LogLevel): void {
        if (!this.levels.has(level)) throw new Error('Invalid log level');
        this.minLevel = level;
    }

    private updateFilePath(): void {
        const newDate: string = new Date().toISOString().split('T')[0];
        if (this.currentDate !== newDate) {
            this.currentDate = newDate;
            const fileName = `${this.currentDate}.log`;
            this.filePath = join(this.dir, fileName);

            if (!existsSync(this.filePath)) {
                const fd: number = openSync(this.filePath, 'w');
                closeSync(fd);
            }
        }
    }

    private formatDetails(details: unknown): string {
        if (details === undefined || details === null || details === '') return '';
        if (details instanceof Error) return details.stack ?? details.message;
        if (typeof details === 'string') return details;

        try {
            return JSON.stringify(details);
        } catch {
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
    public write(level: number, message: string, details?: any): void {
        if (!this._ready) throw new Error('Logger not ready');

        const logLevel: string | undefined = this.levels.get(level);
        if (!logLevel) throw new Error('Invalid log level');

        if (level < this.minLevel) return;

        this.updateFilePath();

        const timestamp: string = new Date().toISOString();
        const detailText: string = this.formatDetails(details);
        const logMessage = `${timestamp} - [${logLevel}] - ${message}${detailText ? ` - (${detailText})` : ''}`;

        const fd: number = openSync(this.filePath, 'a');
        try {
            appendFileSync(fd, `${logMessage}\n`, 'utf-8');
            fsyncSync(fd);
        } finally {
            closeSync(fd);
        }

        console.log(logMessage);
    }

    /**
     * Shortcut for {@link Logger.write} with {@link LogLevel.Info}
     * */
    public info(message: string, details?: unknown): void {
        this.write(LogLevel.Info, message, details);
    }

    /**
     * Shortcut for {@link Logger.write} with {@link LogLevel.Warn}
     * */
    public warn(message: string, details?: unknown): void {
        this.write(LogLevel.Warn, message, details);
    }

    /**
     * Shortcut for {@link Logger.write} with {@link LogLevel.Error}
     * */
    public error(message: string, details?: unknown): void {
        this.write(LogLevel.Error, message, details);
    }

    /**
     * Shortcut for {@link Logger.write} with {@link LogLevel.Debug}
     * */
    public debug(message: string, details?: unknown): void {
        this.write(LogLevel.Debug, message, details);
    }
}