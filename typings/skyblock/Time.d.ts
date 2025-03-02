export = Time;
declare class Time extends EventEmitter<[never]> {
    constructor();
    time: SbTimeFormat;
    on(eventName: any, listener: any): void;
    /**
     * Kann die Skyblock Zeit anhand einer mitgegebenen Zeit berechnen
     * @param {Date} date Zeit welche benutzt werden soll, um die Skyblock Zeit zu berechnen
     * @returns {SbTimeFormat} Skyblock zeit
     * @example
     * const time = sbt.get(new Date());
     * */
    get(date: Date): SbTimeFormat;
    /**
     * Berechnet einen Zeitpunkt in der Zukunft oder Vergangenheit. Die Berechnung basiert auf die angabe des {@link negative} Parameters.
     * @param {SbTimeFormat} sbTime Skyblock Zeit
     * @param {number} sbMinutes Skyblock Minuten welche hinzugefügt oder abgezogen werden sollen
     * @param {boolean} [negative=false] Soll die Zeit in die Vergangenheit berechnet werden
     * @returns {SbTimeFormat} Skyblock Zeit
     * @example
     * const unix = sbt.unix(time, 10);
     * const unix = sbt.unix(time, 10, true);
     * */
    recalculate(sbTime: SbTimeFormat, sbMinutes: number, negative?: boolean): SbTimeFormat;
    #private;
}
import EventEmitter = require("events");
