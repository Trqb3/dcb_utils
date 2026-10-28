export declare const enum LogLevel {
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
    dir: string;
    levels: Map<number, string>;
    minLevel: LogLevel;
    _ready: Ready;
    private filePath;
    private currentDate;
    private static readonly LEVEL_LOOKUP;
    constructor(dir: string, options?: LoggerOptions);
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
    static parseLevel(value: string | undefined, fallback?: LogLevel): LogLevel;
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
    static fromEnv(dir: string, envVar?: string, fallback?: LogLevel): Logger;
    /**
     * Basic request to check if the database connection is ready.
     * @returns Whether the database is ready.
     * */
    get ready(): Ready;
    /**
     * Initializes the logger by creating the log file.
     * @example
     * logger.init();
     * */
    init(): void;
    /**
     * Sets the minimum log level at runtime
     * @param level The new minimum log level to set
     * @example
     * logger.setMinLevel(LogLevel.Error);
     */
    setMinLevel(level: LogLevel): void;
    private updateFilePath;
    private formatDetails;
    /**
     * Append messages to the before created log file.
     * Messages with a level below the minimum will be ignored.
     * @example
     * logger.write(0, 'This is a debug message');
     * logger.write(LogLevel.Debug, 'This is a debug message')
     * */
    write(level: number, message: string, details?: any): void;
    /**
     * Shortcut for {@link Logger.write} with {@link LogLevel.Info}
     * */
    info(message: string, details?: unknown): void;
    /**
     * Shortcut for {@link Logger.write} with {@link LogLevel.Warn}
     * */
    warn(message: string, details?: unknown): void;
    /**
     * Shortcut for {@link Logger.write} with {@link LogLevel.Error}
     * */
    error(message: string, details?: unknown): void;
    /**
     * Shortcut for {@link Logger.write} with {@link LogLevel.Debug}
     * */
    debug(message: string, details?: unknown): void;
}
