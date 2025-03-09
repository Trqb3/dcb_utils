import { Client, ClientEvents } from 'discord.js';
import Logger from '../util/Logger';
import FileManager from '../util/FileManager';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { pathToFileURL } from "url";

export interface EventOptions {
    dir: string;
    client: Client;
    logger: Logger;
}

export default class EventHandler {
    public dir: string;
    public client: Client;
    public logger: Logger;
    public _eventFolders;

    constructor(options: EventOptions) {
        this.client = options.client;
        this.logger = options.logger;

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
                        await (await eventFunction)(arg, this.client, this.logger);
                    }
                };

                this.client.on(String(name), eventHandler);
            }
        }
    }
}