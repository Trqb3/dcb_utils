import { EventEmitter } from 'events';
import { DcbError, DcbTypeError, ErrorCodes } from '../errors/DcbError';

export enum SkyblockMonths {
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

const sbMonths: SkyblockMonths[] = [
    SkyblockMonths.EarlySpring,
    SkyblockMonths.Spring,
    SkyblockMonths.LateSpring,
    SkyblockMonths.EarlySummer,
    SkyblockMonths.Summer,
    SkyblockMonths.LateSummer,
    SkyblockMonths.EarlyAutumn,
    SkyblockMonths.Autumn,
    SkyblockMonths.LateAutumn,
    SkyblockMonths.EarlyWinter,
    SkyblockMonths.Winter,
    SkyblockMonths.LateWinter
];

/**
 * Format of the Skyblock Time.
 * */
export interface SkyblockTime {
    day: number;
    month: SkyblockMonths;
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
    public readonly SB_EPOCH: number;
    public time: SkyblockTime;

    /**
     * Creates a new Time instance.
     * */
    constructor() {
        super();
        this.SB_EPOCH = 1560275700000;
        this.time = this.get(new Date());
    }

    /**
     * Calculates the SkyblockTime based on the given Date.
     * @param {Date} date The Date to calculate the SkyblockTime from.
     * @returns The calculated SkyblockTime.
     * @example
     * sbt.get(new Date());
     * @see Time
     * */
    public get(date: Date): SkyblockTime {
        if (!date) throw new DcbError(ErrorCodes.MissingArgument, 'date');

        const poch: number = date.getTime() - this.SB_EPOCH;
        const sbYear: number = Math.floor(poch / 446400000) + 1;
        const sbMonth: number = Math.floor(poch / 37200000) % 12;
        const sbDay: number = Math.floor(poch / 1200000) % 31;
        const hour: number = Math.floor(poch / 50000) % 24;
        const minute: number = Math.floor(6 * poch / 50000) % 6;

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
            toUnix: (): number => Math.floor((this.SB_EPOCH + (year - 1) * 446400000 + (month - 1) * 37200000 + (day - 1) * 1200000 + hour * 50000 + minute * 50000 / 6) / 1000)
        };
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
     * Adds a listener to the SkyblockTime instance.
     * @param {string} eventName The name of the event.
     * @param {(arg: SkyblockTime) => void} listener The listener to add.
     * @example
     * sbt.on('change', (time: SkyblockTime): void => console.log(time));
     * @see Time
     * @see Time.get
     * */
    public on(eventName: string, listener: (arg: SkyblockTime) => void): this {
        if (!eventName) throw new DcbError(ErrorCodes.MissingArgument, 'eventName');
        if (typeof eventName !== 'string') throw new DcbTypeError(ErrorCodes.InvalidType, 'eventName', 'string');

        if (!listener) throw new DcbError(ErrorCodes.MissingArgument, 'listener');

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
        const now = new Date();
        return (10 - (now.getSeconds() % 10)) * 1000 - now.getMilliseconds();
    }

    private checkTime(): void {
        const sbTime: SkyblockTime = this.get(new Date());
        if (sbTime.string !== this.time.string) {
            this.time = sbTime;
            this.emit('change', sbTime);
        }
    }


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
    public recalculate(sbTime: SkyblockTime, sbMinutes: number, negative = false): SkyblockTime {
        if (!sbTime) throw new DcbError(ErrorCodes.MissingArgument, 'sbTime');
        if (typeof sbTime !== 'object') throw new DcbTypeError(ErrorCodes.InvalidType, 'sbTime', 'object');

        const totalMinutes: number = sbTime.hour * 60 + sbTime.minute + (negative ? -sbMinutes : sbMinutes);

        sbTime.hour = Math.floor((totalMinutes / 60) % 24);
        sbTime.minute = (totalMinutes % 60 + 60) % 60;

        if (totalMinutes < 0 && sbTime.minute > 0) {
            sbTime.hour--;
        }

        sbTime.day += Math.floor(totalMinutes / (24 * 60));

        sbTime = this.adjustTime(sbTime);

        sbTime.string = this.ampm(sbTime.hour, sbTime.minute);

        sbTime.poch = Math.floor(sbTime.day * 1200000 + sbTime.month * 37200000 + (sbTime.year - 1) * 446400000 + sbTime.hour * 50000 + sbTime.minute * 50000 / 6);

        return sbTime;
    }

    private adjustTime(sbTime: SkyblockTime): SkyblockTime {
        while (sbTime.day <= 0 || sbTime.day > 31) {
            if (sbTime.day <= 0) {
                sbTime.day += 31;
                sbTime.month--;
                if (sbTime.month <= 0) {
                    sbTime.month = 12;
                    sbTime.year--;
                }
            } else {
                sbTime.day -= 31;
                sbTime.month++;
                if (sbTime.month > 12) {
                    sbTime.month = 1;
                    sbTime.year++;
                }
            }
        }

        return sbTime;
    }
}