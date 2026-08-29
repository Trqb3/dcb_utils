import { Client } from 'discord.js';
import Logger from '../util/Logger';
import CommandManager from "./CommandManager";
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
export default class EventHandler {
    dir: string;
    client: Client;
    logger: Logger;
    commandManager: CommandManager;
    devs: string[];
    testServer?: string;
    readonly useDefaultCommandInteractionHandler: boolean;
    private readonly eventFolders;
    constructor(options: EventOptions);
    private registerEvents;
    private handleCommandInteraction;
}
