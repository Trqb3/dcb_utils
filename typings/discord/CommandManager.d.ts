import { Client } from "discord.js";
import Logger from "../util/Logger";
export interface CommandManagerOptions {
    dir: string;
    client: Client;
    logger: Logger;
    exceptions?: string[];
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
    private fetchLocalCommands;
    private fetchApplicationCommands;
    private areCommandsDifferent;
    /**
     * Register commands. If GuildId is provided, commands will be registered for that guild only. Otherwise, commands will be registered globally.
     * If the command is marked as deleted, it will be removed.
     * @param guildId - Optional guild ID to register commands for. If not provided, commands will be registered globally.
     * */
    registerCommands(guildId?: string): Promise<void>;
}
