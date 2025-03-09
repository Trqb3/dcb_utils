import { Client, Guild } from "discord.js";
import path, { join } from "path";
import FileManager from "../util/FileManager";
import { existsSync, mkdirSync } from "fs";

export default class CommandManager {
    public dir: string;
    public client: Client;
    public exceptions: string[] | undefined;
    public commands: {
        local: Map<string, any>,
        remote: Map<string, any>
    };

    /**
     * Main class for handling commands within a discord bot
     * @param dir - The directory where the commands are stored
     * @param client - The discord client
     * @param exceptions - An array of command names to exclude from the command manager
     * */
    constructor(dir: string, client: Client, exceptions?: string[]) {
        this.dir = join(dir, 'commands');
        this.client = client;
        this.exceptions = exceptions;

        if (!existsSync(this.dir)) {
            mkdirSync(this.dir);
            mkdirSync(path.join(this.dir, 'general'));
        }

        this.commands = {
            local: new Map(),
            remote: new Map()
        };

        this.fetchLocalCommands();
        this.fetchRemoteCommands();
    }

    private fetchLocalCommands(): void {
        const fm = new FileManager();

        const cmdCats = fm.get(this.dir, true);

        for (const cat of cmdCats) {
            const catName: string = cat.name;
            const catPath: string = join(this.dir, catName);
            const files = fm.get(catPath, true);

            for (const file of files) {
                const fileName: string = file.name;
                const filePath: string = join(catPath, fileName);
                const command = require(filePath);

                if (this.exceptions?.includes(command.name)) continue;

                this.commands.local.set(command.name, command);
            }
        }
    }

    private fetchRemoteCommands(): void {
        this.client.guilds.cache.forEach(async (guild: Guild): Promise<void> => {
            this.commands.remote.set(guild.id, await guild.commands.fetch());
        });
    }
}