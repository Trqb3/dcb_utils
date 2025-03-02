export = EventHandler;
declare class EventHandler {
    /**
     * Startet für jedes Element im Event Ordner einen Event Listener
     * @param {EventOptions} options
     * */
    constructor(options: EventOptions);
    dir: any;
    client: any;
    logger: any;
    _eventFolders: string[];
}
