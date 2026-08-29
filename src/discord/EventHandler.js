"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FileManager_1 = __importDefault(require("../util/FileManager"));
const CommandManager_1 = __importDefault(require("./CommandManager"));
const path_1 = require("path");
const fs_1 = require("fs");
const url_1 = require("url");
const events_1 = require("events");
class EventHandler {
    dir;
    client;
    logger;
    commandManager;
    devs;
    testServer;
    useDefaultCommandInteractionHandler;
    eventFolders;
    constructor(options) {
        this.dir = (0, path_1.join)(options.dir, 'events');
        this.client = options.client;
        this.logger = options.logger;
        this.devs = options.devs ?? [];
        this.testServer = options.testServer;
        this.useDefaultCommandInteractionHandler = options.useDefaultCommandInteractionHandler ?? true;
        this.commandManager = new CommandManager_1.default({
            dir: options.commandsDir ?? options.dir,
            client: this.client,
            logger: this.logger,
            exceptions: options.commandExceptions
        });
        if (!(0, fs_1.existsSync)(this.dir)) {
            (0, fs_1.mkdirSync)(this.dir);
            (0, fs_1.mkdirSync)((0, path_1.join)(this.dir, 'ready'));
        }
        const fm = new FileManager_1.default();
        this.eventFolders = fm.get(this.dir, true);
    }
    async start() {
        for (const folder of this.eventFolders) {
            const fm = new FileManager_1.default();
            const name = folder.name;
            const argName = folder.name;
            const path = (0, path_1.join)(this.dir, name);
            const files = fm.get(path, true);
            files.sort((a, b) => (a > b ? 1 : -1));
            if (name) {
                const eventHandler = async (arg) => {
                    for (const file of files) {
                        const { default: eventFunction } = await import((0, url_1.pathToFileURL)((0, path_1.join)(path, file.name)).href);
                        await (await eventFunction)(arg, this.client, this.logger, this.commandManager);
                    }
                };
                this.client.on(String(name), eventHandler);
            }
        }
        if (!this.client.isReady())
            await (0, events_1.once)(this.client, 'clientReady');
        await this.commandManager.registerCommands();
        if (this.useDefaultCommandInteractionHandler)
            this.client.on('interactionCreate', (interaction) => this.handleCommandInteraction(interaction));
    }
    async handleCommandInteraction(interaction) {
        if (!interaction.isChatInputCommand())
            return;
        const command = this.commandManager.commands.local.get(interaction.commandName);
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
                if (!bot)
                    return;
                for (const permission of command.botPermissions) {
                    if (!bot?.permissions.has(permission)) {
                        await interaction.reply({ content: 'I do not have the required permissions to execute this command.', ephemeral: true });
                        return;
                    }
                }
            }
            await command.callback(interaction, this.client, this.logger);
        }
        catch (error) {
            this.logger.write(2, `Command execution failed: ${interaction.commandName}`, error);
        }
    }
}
exports.default = EventHandler;
