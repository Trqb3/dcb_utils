import { MessageFlagsBitField } from 'discord.js';
import FileManager from '../util/FileManager';
import CommandManager from "./CommandManager";
import { join } from 'path';
import { mkdirSync } from 'fs';
import { pathToFileURL } from "url";
/**
 * Manages Discord events and command interactions.
 * Use `await EventHandler.create(options)` instead of `new`.
 */
export default class EventHandler {
    dir;
    client;
    logger;
    commandManager;
    devs;
    testServer;
    useDefaultCommandInteractionHandler;
    eventFolders;
    constructor(options, commandManager) {
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
        this.client.once('clientReady', async () => {
            await this.commandManager.registerCommands();
            if (this.useDefaultCommandInteractionHandler) {
                this.client.on('interactionCreate', (interaction) => this.handleCommandInteraction(interaction));
            }
            this.logger.info('🔌 Bot startup successful!', this.client.user?.tag);
        });
        this.registerEvents();
    }
    static async create(options) {
        const commandManager = await CommandManager.create({
            dir: options.commandsDir ?? options.dir,
            client: options.client,
            logger: options.logger,
            exceptions: options.commandExceptions
        });
        return new EventHandler(options, commandManager);
    }
    registerEvents() {
        for (const folder of this.eventFolders) {
            const fm = new FileManager();
            const name = folder.name;
            const argName = folder.name;
            const path = join(this.dir, name);
            const files = fm.get(path, true);
            files.sort((a, b) => a.name.localeCompare(b.name));
            if (name) {
                const eventHandler = async (arg) => {
                    for (const file of files) {
                        const { default: eventFunction } = await import(pathToFileURL(join(path, file.name)).href);
                        await eventFunction(arg, this.client, this.logger, this.commandManager);
                    }
                };
                this.client.on(String(name), eventHandler);
            }
        }
    }
    async handleCommandInteraction(interaction) {
        if (!interaction.isChatInputCommand())
            return;
        const command = this.commandManager.commands.local.get(interaction.commandName);
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
                const bot = interaction.guild?.members.me;
                if (!bot)
                    return;
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
        }
        catch (error) {
            this.logger.error(`❌ Command execution failed: ${interaction.commandName}`, error);
        }
    }
}
