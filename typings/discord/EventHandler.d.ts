import { Client } from 'discord.js';
import Logger from '../util/Logger';
import CommandManager from "./CommandManager";
/**
 * Configuration options for the EventHandler.
 * @interface EventOptions
 * @property {string} dir - The directory where the event and command directories will be located.
 * @property {Client} client - The Discord client instance.
 * @property {Logger} logger - The logger instance for logging events and errors.
 * @property {string} [commandsDir] - Optional directory for command files.
 * @property {string[]} [commandExceptions] - Optional list of command exceptions.
 * @property {boolean} [useDefaultCommandInteractionHandler=true] - Whether to use the default command interaction handler.
 * @property {string[]} [devs] - Optional list of developer IDs for dev-only commands.
 * @property {string} [testServer] - Optional test server ID for test-only commands.
 */
export interface EventOptions {
    dir: string;
    client: Client;
    logger: Logger;
    commandsDir?: string;
    commandExceptions?: string[];
    useDefaultCommandInteractionHandler?: boolean;
    devs?: string[];
    testServer?: string;
}
/**
 * Manages Discord events and command interactions.
 * Use `await EventHandler.create(options)` instead of `new`.
 */
export default class EventHandler {
    dir: string;
    client: Client;
    logger: Logger;
    commandManager: CommandManager;
    devs: string[];
    testServer?: string;
    readonly useDefaultCommandInteractionHandler: boolean;
    private readonly eventFolders;
    private constructor();
    static create(options: EventOptions): Promise<EventHandler>;
    private registerEvents;
    private handleCommandInteraction;
}
