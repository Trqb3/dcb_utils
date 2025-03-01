export = SkyblockEvents;
declare class SkyblockEvents {
    /**
     * @param {EventConfig} config Konfiguration für ein Event
     * */
    constructor(config: EventConfig);
    config: any;
    /**
     * Funktion dient zur überprüfung, ob zur angegebenen Skyblock Zeit ein Skyblock Event stattfindet
     * @param {SbTimeFormat} sbTime Skyblock Zeit
     * @param {boolean} negative Soll die Zeit subtrahiert oder addiert werden?
     * @returns {boolean} Soll das Event gepingt werden?
     * @example
     * const ping = event.check(sbt.get(new Date()));
     * */
    check(sbTime: SbTimeFormat, negative?: boolean): boolean;
}
