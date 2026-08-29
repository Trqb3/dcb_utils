import {
    Client,
    Guild,
    ApplicationCommand,
    ApplicationCommandData,
    ApplicationCommandManager,
    GuildApplicationCommandManager
} from "discord.js";
import path, { join } from "path";
import FileManager from "../util/FileManager";
import Logger from "../util/Logger";
import { existsSync, mkdirSync } from "fs";


export interface CommandManagerOptions {
    dir: string;
    client: Client;
    logger: Logger;
    exceptions?: string[];
}

export default class CommandManager {
    public dir: string;
    public client: Client;
    public logger: Logger;
    public exceptions: string[] | undefined;
    public commands: {
        local: Map<string, any>,
        application: Map<string, any>
    };

    /**
     * Main class for handling commands within a discord bot
     * @param options - The options for the command manager
     */
    constructor(options: CommandManagerOptions) {
        this.dir = join(options.dir, 'commands');
        this.client = options.client;
        this.logger = options.logger;
        this.exceptions = options.exceptions;

        if (!existsSync(this.dir)) {
            mkdirSync(this.dir);
            mkdirSync(path.join(this.dir, 'general'));
        }

        this.commands = {
            local: new Map(),
            application: new Map()
        };

        this.fetchLocalCommands();
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

    private async fetchApplicationCommands(guildId?: string): Promise<ApplicationCommandManager | GuildApplicationCommandManager> {
        if (guildId) {
            const guild: Guild = await this.client.guilds.fetch(guildId);
            await guild.commands.fetch();
            return guild.commands;
        }

        const applicationCommands = this.client.application!.commands;
        await applicationCommands.fetch();
        return applicationCommands;
    }

    private areCommandsDifferent(existingCommand: any, localCommand: any): boolean {
        const areChoicesDifferent = (existingChoices: any[], localChoices: any[]): boolean => {
            for (const localChoice of localChoices) {
                const existingChoice = existingChoices?.find(
                    (choice): boolean => choice.name === localChoice.name
                );

                if (!existingChoice) return true;
                if (localChoice.value !== existingChoice.value) return true;
            }
            return false;
        };

        const areOptionsDifferent = (existingOptions: any[], localOptions: any[]): boolean => {
            for (const localOption of localOptions) {
                const existingOption = existingOptions?.find(
                    (option): boolean => option.name === localOption.name
                );

                if (!existingOption) return true;

                if (
                    localOption.description !== existingOption.description ||
                    localOption.type !== existingOption.type ||
                    localOption.required !== existingOption.required ||
                    (localOption.choices?.length || 0) !== (existingOption.choices?.length || 0) ||
                    areChoicesDifferent(
                        localOption.choices || [],
                        existingOption.choices || []
                    )
                ) {
                    return true;
                }
            }
            return false;
        };

        if (
            existingCommand.description !== localCommand.description ||
            existingCommand.options?.length !== (localCommand.options?.length || 0) ||
            areOptionsDifferent(existingCommand.options, localCommand.options || [])
        ) {
            return true;
        }

        return false;
    }

    /**
     * Register commands. If GuildId is provided, commands will be registered for that guild only. Otherwise, commands will be registered globally.
     * If the command is marked as deleted, it will be removed.
     * @param guildId - Optional guild ID to register commands for. If not provided, commands will be registered globally.
     * */
    public async registerCommands(guildId?: string): Promise<void> {
        try {
            const applicationCommands = await this.fetchApplicationCommands(guildId);

            for (const [name, localCommand] of this.commands.local) {
                try {
                    const { description, options } = localCommand;

                    const existingCommand = applicationCommands.cache.find(
                        (cmd: ApplicationCommand): boolean => cmd.name === name
                    );

                    if (existingCommand) {
                        if (localCommand.deleted) {
                            await applicationCommands.delete(existingCommand.id);

                            this.logger.write(0, `Command "${name}" deleted`);

                            continue;
                        }

                        if (this.areCommandsDifferent(existingCommand, localCommand)) {
                            await applicationCommands.edit(existingCommand.id, {
                                description,
                                options
                            });

                            this.logger.write(0, `Command "${name}" updated`);
                        } else {
                            this.logger.write(0, `Command "${name}" unchanged`);
                        }

                        continue;
                    }

                    if (localCommand.deleted) {
                        this.logger.write(0, `Command "${name}" skipped`);

                        continue;
                    }

                    await applicationCommands.create({
                        name,
                        description,
                        options
                    } as ApplicationCommandData);

                    this.logger.write(0, `Command "${name}" created`);
                } catch (error) {
                    this.logger.write(2, `Command "${name}" failed to sync${guildId ? ` for guild [${guildId}]` : ''}`, error);
                }
            }
        } catch (error) {
            this.logger.write(2, `Failed to fetch application commands${guildId ? ` for guild [${guildId}]` : ''}`, error);
        }
    }
}