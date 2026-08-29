import { Client, ChatInputCommandInteraction, ApplicationCommandOptionData, PermissionResolvable } from 'discord.js';
import Logger from '../util/Logger';
import CommandManager from "./CommandManager";
export interface EventOptions {
    dir: string;
    client: Client;
    logger: Logger;
    commandsDir?: string;
    commandExceptions?: string[];
    useDefaultInteractionHandler?: boolean;
    devs?: string[];
    testServer?: string;
}
export interface Command {
    callback: (interaction: ChatInputCommandInteraction, client: Client, logger: Logger) => Promise<void>;
    name: string;
    description: string;
    options?: ApplicationCommandOptionData[];
    devOnly?: boolean;
    testOnly?: boolean;
    permissionsRequired?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];
    deleted?: boolean;
}
export default class EventHandler {
    dir: string;
    client: Client;
    logger: Logger;
    commandManager: CommandManager;
    devs: string[];
    testServer?: string;
    _eventFolders: import("fs").Dirent[];
    constructor(options: EventOptions);
    private handleInteraction;
}
