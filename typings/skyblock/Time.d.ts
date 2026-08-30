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
 * Format of the SkyBlock Time.
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
 * Base class for the SkyBlock Time system calculations.
 * */
export default class Time extends EventEmitter {
    private static readonly SB_EPOCH_MS;
    private static readonly MS_PER_YEAR;
    private static readonly MS_PER_MONTH;
    private static readonly MS_PER_DAY;
    private static readonly MS_PER_HOUR;
    private static readonly TICKS_PER_HOUR;
    private static readonly MINUTES_PER_TICK;
    private static readonly MINUTES_PER_HOUR;
    private static readonly HOURS_PER_DAY;
    private static readonly DAYS_PER_MONTH;
    private static readonly MONTHS_PER_YEAR;
    private static readonly MS_PER_SB_TICK;
    readonly SB_EPOCH: number;
    time: SkyBlockTime;
    /**
     * Creates a new Time instance.
     * */
    constructor();
    /**
     * Calculates the SkyBlockTime based on the given Date.
     * @param {Date} date The Date to calculate the SkyBlockTime from.
     * @returns The calculated SkyBlockTime.
     * @example
     * sbt.get(new Date());
     * @see Time
     * */
    get(date: Date): SkyBlockTime;
    /**
     * Calculates the SkyBlockTime based on the given Date and returns the Unix timestamp (seconds).
     * @returns The calculated Unix timestamp (seconds).
     * */
    private static toUnixFrom;
    private ordinal;
    private ampm;
    /**
     * Adds a listener to the SkyBlockTime instance.
     * @param {string} eventName The name of the event.
     * @param {(arg: SkyBlockTime) => void} listener The listener to add.
     * @example
     * sbt.on('change', (time: SkyBlockTime): void => console.log(time));
     * @see Time
     * @see Time.get
     * */
    on(eventName: string, listener: (arg: SkyBlockTime) => void): this;
    private scheduleNextChange;
    private msUntilNextChange;
    private checkTime;
    /**
     * Calculates the new SkyBlockTime based on the given SkyBlockTime and the given amount of minutes..
     * @param {SkyBlockTime} sbTime The SkyBlockTime to recalculate.
     * @param {number} sbMinutes The amount of minutes to add or subtract.
     * @param {boolean} [negative=false] Whether to subtract the minutes instead of adding them.
     * @example
     * sbt.recaculate(sbt.get(new Date()), 10);
     * @see Time
     * @see Time.get
     * @returns The recalculated SkyBlockTime.
     * */
    recalculate(sbTime: SkyBlockTime, sbMinutes: number, negative?: boolean): SkyBlockTime;
    private adjustTime;
}
