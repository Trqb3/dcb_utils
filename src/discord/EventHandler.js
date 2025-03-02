'use strict';

const path = require("path");
const Files = require("../util/Files");
const { pathToFileURL } = require("url");
const fs = require("fs");

const fm = new Files();

class EventHandler {
    /**
     * Startet für jedes Element im Event Ordner einen Event Listener
     * @param {EventOptions} options
     * */
    constructor(options) {
        this.dir = options.dir;
        this.client = options.client;
        this.logger = options.logger;

        const eventsDir = path.join(this.dir, 'events');

        if (!fs.existsSync(eventsDir)) {
            fs.mkdirSync(eventsDir);
            fs.mkdirSync(path.join(eventsDir, 'ready'));
        }

        this._eventFolders = fm.get(eventsDir, true);

        for (const eventFolder of this._eventFolders) {
            const eventFiles = fm.get(eventFolder, true);

            eventFiles.sort((a, b) => (a > b ? 1 : -1));

            const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();

            if (eventName) {
                this.client.on(eventName, async (arg)  => {
                    for (const eventFile of eventFiles) {
                        const { default: eventFunction } = await import(pathToFileURL(eventFile).href);
                        await (await eventFunction)(arg, this.client, this.logger);
                    }
                });
            }
        }
    }
}

module.exports = EventHandler;