/**
 * Creates a new instance of the Logger class.
 * @param dir The directory to store the log files.
 * @example
 * const logger = new Logger('./logs');
 * */
export default class Logger<Ready extends boolean = boolean> {
    dir: string;
    levels: Map<number, string>;
    _ready: Ready;
    private filePath;
    private currentDate;
    constructor(dir: string);
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
    private updateFilePath;
    /**
     * Append messages to the before created log file.
     * @example
     * logger.write(0, 'This is an info message');
     * */
    write(level: number, message: string, details?: any): void;
}
