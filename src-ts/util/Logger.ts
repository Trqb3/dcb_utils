import { existsSync, mkdirSync, appendFileSync, openSync, fsyncSync, closeSync } from 'fs';
import { join } from 'path';



export const enum LogLevel {
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

    private static readonly LEVEL_LOOKUP: Map<string, LogLevel> = new Map<string, LogLevel>([
        ['debug', LogLevel.Debug],
        ['info', LogLevel.Info],
        ['warn', LogLevel.Warn],
        ['error', LogLevel.Error]
    ]);

    constructor(dir: string, options: LoggerOptions = {}) {
        this.dir = dir;
        this.levels = new Map().set(0, 'DEBUG').set(1, 'INFO').set(2, 'WARN').set(3, 'ERROR');
        this.minLevel = options.minLevel ?? LogLevel.Info;
        this._ready = false as Ready;
        this.filePath = '';
        this.currentDate = '';
    }

    /**
     * Parses a log level name (case-insensitive) into a {@link LogLevel}.
     * Missing or invalid values result in the fallback, invalid ones additionally log a warning.
     * @param value The string to parse, e.g. `process.env.LOG_LEVEL`.
     * @param fallback The level to use if the value is missing or invalid. Default is {@link LogLevel.Info}.
     * @example
     * Logger.parseLevel('WARN'); // LogLevel.Warn
     * Logger.parseLevel(undefined, LogLevel.Debug); // LogLevel.Debug
     * @see {@link Logger.fromEnv Logger creation via environment variable}
     * @returns The parsed log level.
     * */
    public static parseLevel(value: string | undefined, fallback: LogLevel = LogLevel.Info): LogLevel {
        if (!value || !value.trim()) return fallback;

        const level: LogLevel | undefined = Logger.LEVEL_LOOKUP.get(value.trim().toLowerCase());
        if (level === undefined) {
            console.warn(`Invalid log level "${value}", using fallback. Valid values: ${[...Logger.LEVEL_LOOKUP.keys()].join(', ')}`);
            return fallback;
        }

        return level;
    }

    /**
     * Creates a new logger whose minimum log level is read from an environment variable.
     * Remember to call {@link Logger.init} afterwards.
     * @param dir The directory to store the log files.
     * @param envVar The name of the environment variable. Default is `LOG_LEVEL`.
     * @param fallback The level to use if the variable is missing or invalid. Default is {@link LogLevel.Info}.
     * @example
     * // .env: LOG_LEVEL=warn
     * const logger = Logger.fromEnv('./logs');
     * logger.init();
     * @see {@link Logger.parseLevel Log level parsing}
     * @returns A new Logger instance.
     * */
    public static fromEnv(dir: string, envVar: string = 'LOG_LEVEL', fallback: LogLevel = LogLevel.Info): Logger {
        return new Logger(dir, { minLevel: Logger.parseLevel(process.env[envVar], fallback) });
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