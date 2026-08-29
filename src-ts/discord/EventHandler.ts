import { Client, ClientEvents, Interaction, GuildMember } from 'discord.js';
import Logger from '../util/Logger';
import FileManager from '../util/FileManager';
import CommandManager from "./CommandManager";
import { Command } from "./CommandManager";
import { join } from 'path';
import { existsSync, mkdirSync, Dirent } from 'fs';
import { pathToFileURL } from "url";
import { once } from 'events';

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


export default class EventHandler {
    public dir: string;
    public client: Client;
    public logger: Logger;
    public commandManager: CommandManager;
    public devs: string[];
    public testServer?: string;
    public readonly useDefaultCommandInteractionHandler: boolean;
    private readonly eventFolders: Dirent[];

    constructor(options: EventOptions) {
        this.dir = join(options.dir, 'events');
        this.client = options.client;
        this.logger = options.logger;
        this.devs = options.devs ?? [];
        this.testServer = options.testServer;
        this.useDefaultCommandInteractionHandler = options.useDefaultCommandInteractionHandler ?? true;

        this.commandManager = new CommandManager(
            {
                dir: options.commandsDir ?? options.dir,
                client: this.client,
                logger: this.logger,
                exceptions: options.commandExceptions
            }
        );

        if (!existsSync(this.dir)) {
            mkdirSync(this.dir);
            mkdirSync(join(this.dir, 'ready'));
        }

        const fm = new FileManager();
        this.eventFolders = fm.get(this.dir, true);
    }

    public async start(): Promise<void> {
        for (const folder of this.eventFolders) {
            const fm = new FileManager();
            const name: string = folder.name;
            const argName = folder.name as keyof ClientEvents;
            const path: string = join(this.dir, name);
            const files: Dirent[] = fm.get(path, true);

            files.sort((a: Dirent, b: Dirent): 1 | -1 => (a > b ? 1 : -1));

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

        if (!this.client.isReady()) await once(this.client, 'clientReady');
        await this.commandManager.registerCommands();

        if (this.useDefaultCommandInteractionHandler) this.client.on('interactionCreate', (interaction: Interaction): Promise<void> => this.handleCommandInteraction(interaction));
    }


    private async handleCommandInteraction(interaction: Interaction): Promise<void> {
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
                const bot: GuildMember | null | undefined = interaction.guild?.members.me;

                if (!bot) return;

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