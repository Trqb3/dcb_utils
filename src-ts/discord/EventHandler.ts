import { Client, ClientEvents, Interaction, ChatInputCommandInteraction, ApplicationCommandOptionData, PermissionResolvable } from 'discord.js';
import Logger from '../util/Logger';
import FileManager from '../util/FileManager';
import CommandManager from "./CommandManager";
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { pathToFileURL } from "url";

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
    public dir: string;
    public client: Client;
    public logger: Logger;
    public commandManager: CommandManager;
    public devs: string[];
    public testServer?: string;
    public _eventFolders;

    constructor(options: EventOptions) {
        this.client = options.client;
        this.logger = options.logger;
        this.devs = options.devs ?? [];
        this.testServer = options.testServer;

        this.commandManager = new CommandManager(
            options.commandsDir ?? options.dir,
            this.client,
            this.logger,
            options.commandExceptions
        );

        this.dir = join(options.dir, 'events');

        if (!existsSync(this.dir)) {
            mkdirSync(this.dir);
            mkdirSync(join(this.dir, 'ready'));
        }

        const fm = new FileManager();
        this._eventFolders = fm.get(this.dir, true);

        for (const folder of this._eventFolders) {
            const name: string = folder.name;
            const argName = folder.name as keyof ClientEvents;
            const path: string = join(this.dir, name);
            const files = fm.get(path, true);

            files.sort((a, b): 1 | -1 => (a > b ? 1 : -1));

            if (name) {
                const eventHandler = async (arg: ClientEvents[typeof argName]): Promise<void> => {
                    for (const file of files) {
                        const { default: eventFunction } = await import(pathToFileURL(join(path, file.name)).href);
                        await (await eventFunction)(arg, this.client, this.logger, this.commandManager);
                    }
                };

                this.client.on(String(name), eventHandler);
            }
        }

        if (options.useDefaultInteractionHandler !== false) {
            this.client.on('interactionCreate', (interaction): Promise<void> => this.handleInteraction(interaction));
        }
    }


    private async handleInteraction(interaction: Interaction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        const command: Command = this.commandManager.commands.local.get(interaction.commandName);

        if (!command) {
            this.logger.write(1, `Unknown command executed: ${interaction.commandName}`);
            return;
        }

        try {
            if (command.devOnly && !this.devs.includes(interaction.user.id)) {
                await interaction.reply({ content: 'This command is only available to developers.', ephemeral: true });
                return;
            }

            if (command.testOnly && interaction.guildId !== this.testServer) {
                await interaction.reply({ content: 'This command is only available in the test server.', ephemeral: true });
                return;
            }

            if (command.permissionsRequired?.length) {
                for (const permission of command.permissionsRequired) {
                    if (!interaction.memberPermissions?.has(permission)) {
                        await interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
                        return;
                    }
                }
            }

            if (command.botPermissions?.length) {
                const bot = interaction.guild?.members.me;

                for (const permission of command.botPermissions) {
                    if (!bot?.permissions.has(permission)) {
                        await interaction.reply({ content: 'I do not have the required permissions to execute this command.', ephemeral: true });
                        return;
                    }
                }
            }

            await command.callback(interaction, this.client, this.logger);
        } catch (error) {
            this.logger.write(2, `Command execution failed: ${interaction.commandName}`, error);
        }
    }
}