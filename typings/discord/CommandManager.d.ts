import { Client, ChatInputCommandInteraction, PermissionResolvable, ApplicationCommandOptionData } from "discord.js";
import Logger from "../util/Logger";
/**
 * Configuration options for the CommandManager.
 *
 * @interface CommandManagerOptions
 * @property {string} dir - The directory where the command files will be located.
 * @property {Client} client - The Discord client instance.
 * @property {Logger} logger - The logger instance for logging events and errors.
 * @property {string[]} [exceptions] - Optional list of command exceptions.
 */
export interface CommandManagerOptions {
    dir: string;
    client: Client;
    logger: Logger;
    exceptions?: string[];
}
/**
 * @interface Command
 * @property {Function} callback - The function to be called when the command is executed.
 * @property {string} name - The name of the command.
 * @property {string} description - The description of the command.
 * @property {ApplicationCommandOptionData[]} [options] - Optional array of command options.
 * @property {boolean} [devOnly] - Optional flag indicating if the command is for developers only.
 * @property {boolean} [testOnly] - Optional flag indicating if the command is for testing only.
 * @property {PermissionResolvable[]} [permissionsRequired] - Optional array of permissions required by the user to execute the command.
 * @property {PermissionResolvable[]} [botPermissions] - Optional array of permissions required by the bot to execute the command.
 * @property {boolean} [deleted] - Optional flag indicating if the command is marked as deleted.
 * */
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
/**
 * Main class for handling commands within a discord bot
 * @param options - The options for the command manager
 */
export default class CommandManager {
    dir: string;
    client: Client;
    logger: Logger;
    exceptions: string[] | undefined;
    commands: {
        local: Map<string, any>;
        application: Map<string, any>;
    };
    constructor(options: CommandManagerOptions);
    /**
     * Fetches all local commands from the specified directory and stores them in the commands map.
     * @returns {void}
     * */
    private fetchLocalCommands;
    /**
     * Fetches all application commands from the specified guild or the application itself.
     * @param guildId - The ID of the guild to fetch commands for, or undefined to fetch application-wide commands.
     * @returns {Promise<ApplicationCommandManager | GuildApplicationCommandManager>} A promise resolving to the application command manager.
     * */
    private fetchApplicationCommands;
    /**
     * Checks if two commands are different.
     * @param existingCommand - The existing command.
     * @param localCommand - The local command.
     * @returns {boolean} True if the commands are different, false otherwise.
     */
    private areCommandsDifferent;
    /**
     * Register commands. If GuildId is provided, commands will be registered for that guild only. Otherwise, commands will be registered globally.
     * If the command is marked as deleted, it will be removed.
     * @param guildId - Optional guild ID to register commands for. If not provided, commands will be registered globally.
     * */
    registerCommands(guildId?: string): Promise<void>;
}
