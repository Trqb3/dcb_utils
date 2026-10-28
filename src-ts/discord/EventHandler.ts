import { Client, ClientEvents, Interaction, GuildMember, MessageFlagsBitField } from 'discord.js';
import Logger from '../util/Logger';
import FileManager from '../util/FileManager';
import CommandManager from "./CommandManager";
import { Command } from "./CommandManager";
import { join } from 'path';
import { mkdirSync, Dirent } from 'fs';
import { pathToFileURL } from "url";

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
    public dir: string;
    public client: Client;
    public logger: Logger;
    public commandManager: CommandManager;
    public devs: string[];
    public testServer?: string;
    public readonly useDefaultCommandInteractionHandler: boolean;
    private readonly eventFolders: Dirent[];

    private constructor(options: EventOptions, commandManager: CommandManager) {
        this.dir = join(options.dir, 'events');
        this.client = options.client;
        this.logger = options.logger;
        this.devs = options.devs ?? [];
        this.testServer = options.testServer;
        this.commandManager = commandManager;

        this.useDefaultCommandInteractionHandler =
            options.useDefaultCommandInteractionHandler ?? true;

        mkdirSync(this.dir, { recursive: true });
        mkdirSync(join(this.dir, 'clientReady'), { recursive: true });

        const fm = new FileManager();
        this.eventFolders = fm.get(this.dir, true);

        this.client.once('clientReady', async (): Promise<void> => {
            await this.commandManager.registerCommands();

            if (this.useDefaultCommandInteractionHandler) {
                this.client.on(
                    'interactionCreate',
                    (interaction: Interaction): Promise<void> =>
                        this.handleCommandInteraction(interaction)
                );
            }

            this.logger.info('🔌 Bot startup successful!', this.client.user?.tag);
        });

        this.registerEvents();
    }

    public static async create(options: EventOptions): Promise<EventHandler> {
        const commandManager: CommandManager = await CommandManager.create({
            dir: options.commandsDir ?? options.dir,
            client: options.client,
            logger: options.logger,
            exceptions: options.commandExceptions
        });

        return new EventHandler(options, commandManager);
    }

    private registerEvents(): void {
        for (const folder of this.eventFolders) {
            const fm = new FileManager();
            const name: string = folder.name;
            const argName = folder.name as keyof ClientEvents;
            const path: string = join(this.dir, name);
            const files: Dirent[] = fm.get(path, true);

            files.sort((a: Dirent, b: Dirent): number => a.name.localeCompare(b.name));

            if (name) {
                const eventHandler = async (arg: ClientEvents[typeof argName]): Promise<void> => {
                    for (const file of files) {
                        const { default: eventFunction } = await import(pathToFileURL(join(path, file.name)).href);
                        await eventFunction(arg, this.client, this.logger, this.commandManager);
                    }
                };

                this.client.on(String(name), eventHandler);
            }
        }
    }

    private async handleCommandInteraction(interaction: Interaction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        const command: Command = this.commandManager.commands.local.get(interaction.commandName);

        if (!command) {
            this.logger.warn(`⚠️ Unknown command executed: ${interaction.commandName}`);
            return;
        }

        try {
            if (command.devOnly && !this.devs.includes(interaction.user.id)) {
                await interaction.reply({ content: 'This command is only available to developers.',
                    flags: MessageFlagsBitField.Flags.Ephemeral
                });
                return;
            }

            if (command.testOnly && interaction.guildId !== this.testServer) {
                await interaction.reply({ content: 'This command is only available in the test server.',
                    flags: MessageFlagsBitField.Flags.Ephemeral
                });
                return;
            }

            if (command.permissionsRequired?.length) {
                for (const permission of command.permissionsRequired) {
                    if (!interaction.memberPermissions?.has(permission)) {
                        await interaction.reply({ content: 'You do not have the required permissions to use this command.',
                            flags: MessageFlagsBitField.Flags.Ephemeral
                        });
                        return;
                    }
                }
            }

            if (command.botPermissions?.length) {
                const bot: GuildMember | null | undefined = interaction.guild?.members.me;

                if (!bot) return;

                for (const permission of command.botPermissions) {
                    if (!bot?.permissions.has(permission)) {
                        await interaction.reply({ content: 'I do not have the required permissions to execute this command.',
                            flags: MessageFlagsBitField.Flags.Ephemeral
                        });
                        return;
                    }
                }
            }

            await command.callback(interaction, this.client, this.logger);
        } catch (error) {
            this.logger.error(`❌ Command execution failed: ${interaction.commandName}`, error);
        }
    }
}