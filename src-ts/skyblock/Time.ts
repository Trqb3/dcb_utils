import { EventEmitter } from 'events';
import { DcbError, DcbTypeError, DcbErrorCodes } from '../errors/DcbError';

export enum SkyBlockMonths {
    EarlySpring = 1,
    Spring,
    LateSpring,
    EarlySummer,
    Summer,
    LateSummer,
    EarlyAutumn,
    Autumn,
    LateAutumn,
    EarlyWinter,
    Winter,
    LateWinter
}

const sbMonths: SkyBlockMonths[] = [
    SkyBlockMonths.EarlySpring,
    SkyBlockMonths.Spring,
    SkyBlockMonths.LateSpring,
    SkyBlockMonths.EarlySummer,
    SkyBlockMonths.Summer,
    SkyBlockMonths.LateSummer,
    SkyBlockMonths.EarlyAutumn,
    SkyBlockMonths.Autumn,
    SkyBlockMonths.LateAutumn,
    SkyBlockMonths.EarlyWinter,
    SkyBlockMonths.Winter,
    SkyBlockMonths.LateWinter
];

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
    private static readonly SB_EPOCH_MS: number = 1560275700000;
    private static readonly MS_PER_YEAR: number = 446400000;
    private static readonly MS_PER_MONTH: number = 37200000;
    private static readonly MS_PER_DAY: number = 1200000;
    private static readonly MS_PER_HOUR: number = 50000;
    private static readonly TICKS_PER_HOUR: number = 6;
    private static readonly MINUTES_PER_TICK: number = 10;
    private static readonly MINUTES_PER_HOUR: number = 60;
    private static readonly HOURS_PER_DAY: number = 24;
    private static readonly DAYS_PER_MONTH: number = 31;
    private static readonly MONTHS_PER_YEAR: number = 12;
    private static readonly MS_PER_SB_TICK: number = Time.MS_PER_HOUR / Time.TICKS_PER_HOUR;

    public readonly SB_EPOCH: number;
    public time: SkyBlockTime;

    /**
     * Creates a new Time instance.
     * */
    constructor() {
        super();
        this.SB_EPOCH = Time.SB_EPOCH_MS;
        this.time = this.get(new Date());
    }

    /**
     * Calculates the SkyBlockTime based on the given Date.
     * @param {Date} date The Date to calculate the SkyBlockTime from.
     * @returns The calculated SkyBlockTime.
     * @example
     * sbt.get(new Date());
     * @see Time
     * */
    public get(date: Date): SkyBlockTime {
        if (!date) throw new DcbError(DcbErrorCodes.MissingArgument, 'date');

        const poch: number = date.getTime() - Time.SB_EPOCH_MS;
        const sbYear: number = Math.floor(poch / Time.MS_PER_YEAR) + 1;
        const sbMonth: number = Math.floor(poch / Time.MS_PER_MONTH) % Time.MONTHS_PER_YEAR;
        const sbDay: number = Math.floor(poch / Time.MS_PER_DAY) % Time.DAYS_PER_MONTH;
        const hour: number = Math.floor(poch / Time.MS_PER_HOUR) % Time.HOURS_PER_DAY;
        const minute: number = Math.floor(Time.TICKS_PER_HOUR * poch / Time.MS_PER_HOUR) % Time.TICKS_PER_HOUR;

        const day: number = this.ordinal(sbDay + 1);
        const month: number = sbMonths[sbMonth];
        const year: number = sbYear;
        const string: string = this.ampm(hour, minute);

        return {
            day,
            month,
            year,
            string,
            hour,
            minute,
            poch,
            toUnix(): number {
                return Time.toUnixFrom(this);
            }
        };
    }

    /**
     * Calculates the SkyBlockTime based on the given Date and returns the Unix timestamp (seconds).
     * @returns The calculated Unix timestamp (seconds).
     * */
    private static toUnixFrom(t: Pick<SkyBlockTime, 'year' | 'month' | 'day' | 'hour' | 'minute'>): number {
        return Math.floor((
            Time.SB_EPOCH_MS +
            (t.year - 1) * Time.MS_PER_YEAR +
            (t.month - 1) * Time.MS_PER_MONTH +
            (t.day - 1) * Time.MS_PER_DAY +
            t.hour * Time.MS_PER_HOUR +
            t.minute * Time.MS_PER_SB_TICK
        ) / 1000);
    }

    private ordinal(n: number): number {
        const v: number = n % 100;
        return n + ((v - 20) % 1);
    }

    private ampm(h: number, m: number): string {
        const s: string[] = ['am', 'pm'];
        const suffix: string = s[Math.floor(h / 12)];
        h = h % 12;
        if (h === 0) {
            h = 12;
        }
        return `${h}:${m}0${suffix}`;
    }

    /**
     * Adds a listener to the SkyBlockTime instance.
     * @param {string} eventName The name of the event.
     * @param {(arg: SkyBlockTime) => void} listener The listener to add.
     * @example
     * sbt.on('change', (time: SkyBlockTime): void => console.log(time));
     * @see Time
     * @see Time.get
     * */
    public on(eventName: string, listener: (arg: SkyBlockTime) => void): this {
        if (!eventName) throw new DcbError(DcbErrorCodes.MissingArgument, 'eventName');
        if (typeof eventName !== 'string') throw new DcbTypeError(DcbErrorCodes.InvalidType, 'eventName', 'string');

        if (!listener) throw new DcbError(DcbErrorCodes.MissingArgument, 'listener');

        super.on(eventName, listener);
        if (eventName === 'change' && this.listenerCount('change') === 1) {
            this.scheduleNextChange();
        }

        return this;
    }

    private scheduleNextChange(): void {
        const ms: number = this.msUntilNextChange();
        setTimeout((): void => {
            this.checkTime();
            this.scheduleNextChange();
        }, ms);
    }

    private msUntilNextChange(): number {
        const now: number = Date.now();
        const msSinceEpoch: number = now - Time.SB_EPOCH_MS;
        return Time.MS_PER_SB_TICK - (msSinceEpoch % Time.MS_PER_SB_TICK);
    }

    private checkTime(): void {
        const sbTime: SkyBlockTime = this.get(new Date());
        if (sbTime.string !== this.time.string) {
            this.time = sbTime;
            this.emit('change', sbTime);
        }
    }

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
    public recalculate(sbTime: SkyBlockTime, sbMinutes: number, negative = false): SkyBlockTime {
        if (!sbTime) throw new DcbError(DcbErrorCodes.MissingArgument, 'sbTime');
        if (typeof sbTime !== 'object') throw new DcbTypeError(DcbErrorCodes.InvalidType, 'sbTime', 'object');

        const totalMinutes: number =
            sbTime.hour * Time.MINUTES_PER_HOUR +
            sbTime.minute * Time.MINUTES_PER_TICK +
            (negative ? -sbMinutes : sbMinutes);

        const minutesPerDay: number = Time.HOURS_PER_DAY * Time.MINUTES_PER_HOUR;
        const dayCarry: number = Math.floor(totalMinutes / minutesPerDay);
        const remaining: number = totalMinutes - dayCarry * minutesPerDay; // immer 0..1439

        sbTime.day += dayCarry;
        sbTime.hour = Math.floor(remaining / Time.MINUTES_PER_HOUR);
        sbTime.minute = Math.floor((remaining % Time.MINUTES_PER_HOUR) / Time.MINUTES_PER_TICK);

        sbTime = this.adjustTime(sbTime);

        sbTime.string = this.ampm(sbTime.hour, sbTime.minute);

        sbTime.poch = Math.floor(
            sbTime.day * Time.MS_PER_DAY +
            sbTime.month * Time.MS_PER_MONTH +
            (sbTime.year - 1) * Time.MS_PER_YEAR +
            sbTime.hour * Time.MS_PER_HOUR +
            sbTime.minute * Time.MS_PER_SB_TICK
        );

        sbTime.toUnix = function (this: SkyBlockTime): number {
            return Time.toUnixFrom(this);
        };

        return sbTime;
    }

    private adjustTime(sbTime: SkyBlockTime): SkyBlockTime {
        while (sbTime.day <= 0 || sbTime.day > Time.DAYS_PER_MONTH) {
            if (sbTime.day <= 0) {
                sbTime.day += Time.DAYS_PER_MONTH;
                sbTime.month--;
                if (sbTime.month <= 0) {
                    sbTime.month = Time.MONTHS_PER_YEAR;
                    sbTime.year--;
                }
            } else {
                sbTime.day -= Time.DAYS_PER_MONTH;
                sbTime.month++;
                if (sbTime.month > Time.MONTHS_PER_YEAR) {
                    sbTime.month = 1;
                    sbTime.year++;
                }
            }
        }

        return sbTime;
    }
}