import { EventEmitter } from 'events';
export declare enum SkyBlockMonths {
    EarlySpring = 1,
    Spring = 2,
    LateSpring = 3,
    EarlySummer = 4,
    Summer = 5,
    LateSummer = 6,
    EarlyAutumn = 7,
    Autumn = 8,
    LateAutumn = 9,
    EarlyWinter = 10,
    Winter = 11,
    LateWinter = 12
}
/**
 * Format of the Skyblock Time.
 * */
export interface SkyBlockTime {
    day: number;
    month: SkyBlockMonths;
    year: number;
    string: string;
    hour: number;
    minute: number;
    poch: number;
    toUnix: () => number;
}
/**
 * Base class for the Skyblock Time system calculations.
 * */
export default class Time extends EventEmitter {
    readonly SB_EPOCH: number;
    time: SkyBlockTime;
    /**
     * Creates a new Time instance.
     * */
    constructor();
    /**
     * Calculates the SkyblockTime based on the given Date.
     * @param {Date} date The Date to calculate the SkyblockTime from.
     * @returns The calculated SkyblockTime.
     * @example
     * sbt.get(new Date());
     * @see Time
     * */
    get(date: Date): SkyBlockTime;
    private ordinal;
    private ampm;
    /**
     * Adds a listener to the SkyblockTime instance.
     * @param {string} eventName The name of the event.
     * @param {(arg: SkyblockTime) => void} listener The listener to add.
     * @example
     * sbt.on('change', (time: SkyblockTime): void => console.log(time));
     * @see Time
     * @see Time.get
     * */
    on(eventName: string, listener: (arg: SkyBlockTime) => void): this;
    private scheduleNextChange;
    private msUntilNextChange;
    private checkTime;
    /**
     * Calculates the new SkyblockTime based on the given SkyblockTime and the given amount of minutes.
     * @param {SkyblockTime} sbTime The SkyblockTime to recalculate.
     * @param {number} sbMinutes The amount of minutes to add or subtract.
     * @param {boolean} [negative=false] Whether to subtract the minutes instead of adding them.
     * @example
     * sbt.recaculate(sbt.get(new Date()), 10);
     * @see Time
     * @see Time.get
     * @returns The recalculated SkyblockTime.
     * */
    recalculate(sbTime: SkyBlockTime, sbMinutes: number, negative?: boolean): SkyBlockTime;
    private adjustTime;
}
