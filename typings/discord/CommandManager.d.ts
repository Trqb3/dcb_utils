import { Client, ChatInputCommandInteraction, PermissionResolvable, ApplicationCommandOptionData } from "discord.js";
import Logger from "../util/Logger";
export interface CommandManagerOptions {
    dir: string;
    client: Client;
    logger: Logger;
    exceptions?: string[];
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
export default class CommandManager {
    dir: string;
    client: Client;
    logger: Logger;
    exceptions: string[] | undefined;
    commands: {
        local: Map<string, any>;
        application: Map<string, any>;
    };
    /**
     * Main class for handling commands within a discord bot
     * @param options - The options for the command manager
     */
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
