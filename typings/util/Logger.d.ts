declare const enum LogLevel {
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
    constructor(dir: string, options?: LoggerOptions);
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
export {};
