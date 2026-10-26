import {
    Client,
    Guild,
    GuildApplicationCommandManager,
    ChatInputCommandInteraction,
    PermissionResolvable,
    ApplicationCommand,
    ApplicationCommandData,
    ApplicationCommandManager,
    ApplicationCommandOptionData
} from "discord.js";
import { join } from "path";
import FileManager from "../util/FileManager";
import Logger from "../util/Logger";
import { mkdirSync, Dirent } from "fs";
import { pathToFileURL } from "url";


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

interface CommandChoice {
    name: string;
    value: string | number;
}

interface CommandOption {
    name: string;
    description?: string;
    type: number;
    required?: boolean;
    choices?: CommandChoice[];
}

interface CommandChoices {
    application: CommandChoice[];
    local: CommandChoice[];
}

interface CommandOptions {
    application: CommandOption[];
    local: CommandOption[];
}

/**
 * Main class for handling commands within a discord bot
 * @param options - The options for the command manager
 */
export default class CommandManager {
    public dir: string;
    public client: Client;
    public logger: Logger;
    public exceptions: string[] | undefined;
    public commands: {
        local: Map<string, any>,
        application: Map<string, any>
    };

    private constructor(options: CommandManagerOptions) {
        this.dir = join(options.dir, 'commands');
        this.client = options.client;
        this.logger = options.logger;
        this.exceptions = options.exceptions;

        mkdirSync(this.dir, { recursive: true });
        mkdirSync(join(this.dir, 'default'), { recursive: true });

        this.commands = {
            local: new Map(),
            application: new Map()
        };
    }

    public static async create(options: CommandManagerOptions): Promise<CommandManager> {
        const manager = new CommandManager(options);
        await manager.fetchLocalCommands();
        return manager;
    }

    /**
     * Fetches all local commands from the specified directory and stores them in the commands map.
     * @returns {void}
     * */
    private async fetchLocalCommands(): Promise<void> {
        const fm = new FileManager();
        const cmdCats: Dirent[] = fm.get(this.dir, true);

        for (const cat of cmdCats) {
            const catName: string = cat.name;
            const catPath: string = join(this.dir, catName);
            const files: Dirent[] = fm.get(catPath, true);

            for (const file of files) {
                const fileName: string = file.name;
                const filePath: string = join(catPath, fileName);
                const command: Command = (await import(pathToFileURL(filePath).href)).default;

                if (this.exceptions?.includes(command.name)) continue;

                this.commands.local.set(command.name, command);
            }
        }
    }

    /**
     * Fetches all application commands from the specified guild or the application itself.
     * @param guildId - The ID of the guild to fetch commands for, or undefined to fetch application-wide commands.
     * @returns {Promise<ApplicationCommandManager | GuildApplicationCommandManager>} A promise resolving to the application command manager.
     * */
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

    /**
     * Checks if two commands are different.
     * @param existingCommand - The existing command.
     * @param localCommand - The local command.
     * @returns {boolean} True if the commands are different, false otherwise.
     */
    private areCommandsDifferent(existingCommand: any, localCommand: any): boolean {
        const areChoicesDifferent: (choices: CommandChoices) => boolean = (choices: CommandChoices): boolean => {
            for (const localChoice of choices.local) {
                const existingChoice: CommandChoice | undefined = choices.application?.find(
                    (choice: CommandChoice): boolean => choice.name === localChoice.name
                );

                if (!existingChoice) return true;
                if (localChoice.value !== existingChoice.value) return true;
            }
            return false;
        };

        const areOptionsDifferent: (options: CommandOptions) => boolean = (options: CommandOptions): boolean => {
            for (const localOption of options.local) {
                const existingOption: CommandOption | undefined = options.application?.find(
                    (option: CommandOption): boolean => option.name === localOption.name
                );

                if (!existingOption) return true;

                if (
                    localOption.description !== existingOption.description ||
                    localOption.type !== existingOption.type ||
                    localOption.required !== existingOption.required ||
                    (localOption.choices?.length || 0) !== (existingOption.choices?.length || 0) ||
                    areChoicesDifferent({
                        local: localOption.choices || [],
                        application: existingOption.choices || []
                    })
                ) {
                    return true;
                }
            }
            return false;
        };

        return existingCommand.description !== localCommand.description ||
            existingCommand.options?.length !== (localCommand.options?.length || 0) ||
            areOptionsDifferent({
                application: existingCommand.options,
                local: localCommand.options || []
            });
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

                    const existingCommand: ApplicationCommand | undefined = applicationCommands.cache.find(
                        (cmd: ApplicationCommand): boolean => cmd.name === name
                    );

                    if (existingCommand) {
                        if (localCommand.deleted) {
                            await applicationCommands.delete(existingCommand.id);

                            this.logger.write(0, `🗑️ Command "${name}" deleted`);

                            continue;
                        }

                        if (this.areCommandsDifferent(existingCommand, localCommand)) {
                            await applicationCommands.edit(existingCommand.id, {
                                description,
                                options
                            });

                            this.logger.write(0, `🔄 Command "${name}" updated`);
                        } else {
                            this.logger.write(0, `⏭️ Command "${name}" unchanged`);
                        }

                        continue;
                    }

                    if (localCommand.deleted) {
                        this.logger.write(0, `⏭️ Command "${name}" skipped`);

                        continue;
                    }

                    await applicationCommands.create({
                        name,
                        description,
                        options
                    } as ApplicationCommandData);

                    this.logger.write(0, `✅ Command "${name}" created`);
                } catch (error) {
                    this.logger.write(2, `❌ Command "${name}" failed to sync${guildId ? ` for guild [${guildId}]` : ''}`, error);
                }
            }
        } catch (error) {
            this.logger.write(2, `❌ Failed to fetch application commands${guildId ? ` for guild [${guildId}]` : ''}`, error);
        }
    }
}