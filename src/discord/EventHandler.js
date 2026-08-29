"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FileManager_1 = __importDefault(require("../util/FileManager"));
const path_1 = require("path");
const fs_1 = require("fs");
const url_1 = require("url");
class EventHandler {
    dir;
    client;
    logger;
    _eventFolders;
    constructor(options) {
        this.client = options.client;
        this.logger = options.logger;
        this.dir = (0, path_1.join)(options.dir, 'events');
        if (!(0, fs_1.existsSync)(this.dir)) {
            (0, fs_1.mkdirSync)(this.dir);
            (0, fs_1.mkdirSync)((0, path_1.join)(this.dir, 'ready'));
        }
        const fm = new FileManager_1.default();
        this._eventFolders = fm.get(this.dir, true);
        for (const folder of this._eventFolders) {
            const name = folder.name;
            const argName = folder.name;
            const path = (0, path_1.join)(this.dir, name);
            const files = fm.get(path, true);
            files.sort((a, b) => (a > b ? 1 : -1));
            if (name) {
                const eventHandler = async (arg) => {
                    for (const file of files) {
                        const { default: eventFunction } = await import((0, url_1.pathToFileURL)((0, path_1.join)(path, file.name)).href);
                        await (await eventFunction)(arg, this.client, this.logger);
                    }
                };
                this.client.on(String(name), eventHandler);
            }
        }
    }
}
exports.default = EventHandler;
