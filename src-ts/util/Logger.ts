import { existsSync, mkdirSync, writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';

export default class Logger<Ready extends boolean = boolean> {
    public dir: string;
    public levels: Map<number, string>;
    public _ready: Ready;
    private filePath: string;

    /**
     * Creates a new instance of the Logger class.
     * @param dir The directory to store the log files.
     * @example
     * const logger = new Logger('./logs');
     * */
    constructor(dir: string) {
        this.dir = dir;
        this.levels = new Map().set(0, 'INFO').set(1, 'WARN').set(2, 'ERROR').set(3, 'DEBUG');
        this._ready = false as Ready;
        this.filePath = '';
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

        const fileName = `${new Date().toISOString().split('T')[0]}.log`;
        this.filePath = join(this.dir, fileName);

        writeFileSync(this.filePath, '');
        this._ready = true as Ready;
    }

    /**
     * Append messages to the before created log file.
     * @example
     * logger.write(0, 'This is an info message');
     * */
    public write(level: number, message: string, details?: any): void {
        if (!this._ready) throw new Error('Logger not ready');

        try {
            const timestamp: string = new Date().toISOString();
            const logLevel = this.levels.get(level);
            const logMessage = `${timestamp} - [${logLevel}] - ${message} ${details ? `- (${details})` : ''}`;

            appendFileSync(this.filePath, `${logMessage}\n`, 'utf-8');
            console.log(logMessage);
        } catch (error) {
            throw error;
        }
    }
}