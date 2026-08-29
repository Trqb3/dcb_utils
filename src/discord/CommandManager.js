"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const FileManager_1 = __importDefault(require("../util/FileManager"));
const fs_1 = require("fs");
class CommandManager {
    dir;
    client;
    logger;
    exceptions;
    commands;
    /**
     * Main class for handling commands within a discord bot
     * @param options - The options for the command manager
     */
    constructor(options) {
        this.dir = (0, path_1.join)(options.dir, 'commands');
        this.client = options.client;
        this.logger = options.logger;
        this.exceptions = options.exceptions;
        (0, fs_1.mkdirSync)(this.dir, { recursive: true });
        (0, fs_1.mkdirSync)((0, path_1.join)(this.dir, 'default'), { recursive: true });
        this.commands = {
            local: new Map(),
            application: new Map()
        };
        this.fetchLocalCommands();
    }
    /**
     * Fetches all local commands from the specified directory and stores them in the commands map.
     * @returns {void}
     * */
    fetchLocalCommands() {
        const fm = new FileManager_1.default();
        const cmdCats = fm.get(this.dir, true);
        for (const cat of cmdCats) {
            const catName = cat.name;
            const catPath = (0, path_1.join)(this.dir, catName);
            const files = fm.get(catPath, true);
            for (const file of files) {
                const fileName = file.name;
                const filePath = (0, path_1.join)(catPath, fileName);
                const command = require(filePath).default;
                if (this.exceptions?.includes(command.name))
                    continue;
                this.commands.local.set(command.name, command);
            }
        }
    }
    /**
     * Fetches all application commands from the specified guild or the application itself.
     * @param guildId - The ID of the guild to fetch commands for, or undefined to fetch application-wide commands.
     * @returns {Promise<ApplicationCommandManager | GuildApplicationCommandManager>} A promise resolving to the application command manager.
     * */
    async fetchApplicationCommands(guildId) {
        if (guildId) {
            const guild = await this.client.guilds.fetch(guildId);
            await guild.commands.fetch();
            return guild.commands;
        }
        const applicationCommands = this.client.application.commands;
        await applicationCommands.fetch();
        return applicationCommands;
    }
    /**
     * Checks if two commands are different.
     * @param existingCommand - The existing command.
     * @param localCommand - The local command.
     * @returns {boolean} True if the commands are different, false otherwise.
     */
    areCommandsDifferent(existingCommand, localCommand) {
        const areChoicesDifferent = (choices) => {
            for (const localChoice of choices.local) {
                const existingChoice = choices.application?.find((choice) => choice.name === localChoice.name);
                if (!existingChoice)
                    return true;
                if (localChoice.value !== existingChoice.value)
                    return true;
            }
            return false;
        };
        const areOptionsDifferent = (options) => {
            for (const localOption of options.local) {
                const existingOption = options.application?.find((option) => option.name === localOption.name);
                if (!existingOption)
                    return true;
                if (localOption.description !== existingOption.description ||
                    localOption.type !== existingOption.type ||
                    localOption.required !== existingOption.required ||
                    (localOption.choices?.length || 0) !== (existingOption.choices?.length || 0) ||
                    areChoicesDifferent({
                        local: localOption.choices || [],
                        application: existingOption.choices || []
                    })) {
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
    async registerCommands(guildId) {
        try {
            const applicationCommands = await this.fetchApplicationCommands(guildId);
            for (const [name, localCommand] of this.commands.local) {
                try {
                    const { description, options } = localCommand;
                    const existingCommand = applicationCommands.cache.find((cmd) => cmd.name === name);
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
                        }
                        else {
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
                    });
                    this.logger.write(0, `✅ Command "${name}" created`);
                }
                catch (error) {
                    this.logger.write(2, `❌ Command "${name}" failed to sync${guildId ? ` for guild [${guildId}]` : ''}`, error);
                }
            }
        }
        catch (error) {
            this.logger.write(2, `❌ Failed to fetch application commands${guildId ? ` for guild [${guildId}]` : ''}`, error);
        }
    }
}
exports.default = CommandManager;
