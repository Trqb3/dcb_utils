'use strict';

const path = require("path");
const { Client } = require("discord.js");
const Files = require("../util/Files");
const fs = require("fs");

const fm = new Files();

class CommandManager {
    /**
     * Hauptklasse für das nutzen von Discord Commands
     * @param {string} dir
     * @param {Client} client
     * @param {string[]} exceptions
     * */
    constructor(dir, client, exceptions = []) {
        this.dir = path.join(dir, 'commands');
        this.client = client;
        this.exeptions = exceptions;

        if (!fs.existsSync(this.dir)) {
            fs.mkdirSync(this.dir);
            fs.mkdirSync(path.join(this.dir, 'general'));
        }

        this.commands = {
            local: new Map(),
            remote: new Map()
        };

        this.#localCommands();
        this.#applicationCommands();
    }

    #localCommands() {
        const commandCategories = fm.get(this.dir, true);

        for (const category of commandCategories) {
            const commandFiles = fm.get(category, true);

            for (const file of commandFiles) {
                const command = require(file);

                if (this.exeptions.includes(command.name)) continue;

                this.commands.local.set(command.name, command);
            }
        }
    }

    #applicationCommands() {
        this.client.guilds.cache.forEach(async guild => {
            this.commands.remote.set(guild.id, await guild.commands.fetch());
        });
    }
}

module.exports = CommandManager;