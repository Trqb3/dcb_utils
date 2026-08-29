import { existsSync, mkdirSync, appendFileSync, openSync, fsyncSync, closeSync } from 'fs';
import { join } from 'path';

export default class Logger<Ready extends boolean = boolean> {
    public dir: string;
    public levels: Map<number, string>;
    public _ready: Ready;
    private filePath: string;
    private currentDate: string;

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

    /**
     * Append messages to the before created log file.
     * @example
     * logger.write(0, 'This is an info message');
     * */
    public write(level: number, message: string, details?: any): void {
        if (!this._ready) throw new Error('Logger not ready');

        try {
            this.updateFilePath();

            const timestamp: string = new Date().toISOString();
            const logLevel: string | undefined = this.levels.get(level);

            if (!logLevel) throw new Error('Invalid log level');

            const logMessage = `${timestamp} - [${logLevel}] - ${message} ${details ? `- (${details})` : ''}`;

            const fd: number = openSync(this.filePath, 'a');
            appendFileSync(fd, `${logMessage}\n`, 'utf-8');
            fsyncSync(fd);
            closeSync(fd);

            console.log(logMessage);
        } catch (error) {
            throw error;
        }
    }
}