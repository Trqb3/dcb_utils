import { Client } from 'discord.js';
import Logger from '../util/Logger';
export interface EventOptions {
    dir: string;
    client: Client;
    logger: Logger;
}
export default class EventHandler {
    dir: string;
    client: Client;
    logger: Logger;
    _eventFolders: import("fs").Dirent[];
    constructor(options: EventOptions);
}
