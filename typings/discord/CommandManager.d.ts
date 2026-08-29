import { Client } from "discord.js";
export default class CommandManager {
    dir: string;
    client: Client;
    exceptions: string[] | undefined;
    commands: {
        local: Map<string, any>;
        remote: Map<string, any>;
    };
    /**
     * Main class for handling commands within a discord bot
     * @param dir - The directory where the commands are stored
     * @param client - The discord client
     * @param exceptions - An array of command names to exclude from the command manager
     * */
    constructor(dir: string, client: Client, exceptions?: string[]);
    private fetchLocalCommands;
    private fetchRemoteCommands;
}
