"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importStar(require("path"));
const FileManager_1 = __importDefault(require("../util/FileManager"));
const fs_1 = require("fs");
class CommandManager {
    dir;
    client;
    exceptions;
    commands;
    /**
     * Main class for handling commands within a discord bot
     * @param dir - The directory where the commands are stored
     * @param client - The discord client
     * @param exceptions - An array of command names to exclude from the command manager
     * */
    constructor(dir, client, exceptions) {
        this.dir = (0, path_1.join)(dir, 'commands');
        this.client = client;
        this.exceptions = exceptions;
        if (!(0, fs_1.existsSync)(this.dir)) {
            (0, fs_1.mkdirSync)(this.dir);
            (0, fs_1.mkdirSync)(path_1.default.join(this.dir, 'general'));
        }
        this.commands = {
            local: new Map(),
            remote: new Map()
        };
        this.fetchLocalCommands();
        this.fetchRemoteCommands();
    }
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
                const command = require(filePath);
                if (this.exceptions?.includes(command.name))
                    continue;
                this.commands.local.set(command.name, command);
            }
        }
    }
    fetchRemoteCommands() {
        this.client.guilds.cache.forEach(async (guild) => {
            this.commands.remote.set(guild.id, await guild.commands.fetch());
        });
    }
}
exports.default = CommandManager;
