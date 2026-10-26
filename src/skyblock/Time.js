import { EventEmitter } from 'events';
import { DcbError, DcbTypeError, DcbErrorCodes } from '../errors/DcbError';
export var SkyBlockMonths;
(function (SkyBlockMonths) {
    SkyBlockMonths[SkyBlockMonths["EarlySpring"] = 1] = "EarlySpring";
    SkyBlockMonths[SkyBlockMonths["Spring"] = 2] = "Spring";
    SkyBlockMonths[SkyBlockMonths["LateSpring"] = 3] = "LateSpring";
    SkyBlockMonths[SkyBlockMonths["EarlySummer"] = 4] = "EarlySummer";
    SkyBlockMonths[SkyBlockMonths["Summer"] = 5] = "Summer";
    SkyBlockMonths[SkyBlockMonths["LateSummer"] = 6] = "LateSummer";
    SkyBlockMonths[SkyBlockMonths["EarlyAutumn"] = 7] = "EarlyAutumn";
    SkyBlockMonths[SkyBlockMonths["Autumn"] = 8] = "Autumn";
    SkyBlockMonths[SkyBlockMonths["LateAutumn"] = 9] = "LateAutumn";
    SkyBlockMonths[SkyBlockMonths["EarlyWinter"] = 10] = "EarlyWinter";
    SkyBlockMonths[SkyBlockMonths["Winter"] = 11] = "Winter";
    SkyBlockMonths[SkyBlockMonths["LateWinter"] = 12] = "LateWinter";
})(SkyBlockMonths || (SkyBlockMonths = {}));
const sbMonths = [
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
 * Base class for the SkyBlock Time system calculations.
 * */
export default class Time extends EventEmitter {
    static SB_EPOCH_MS = 1560275700000;
    static MS_PER_YEAR = 446400000;
    static MS_PER_MONTH = 37200000;
    static MS_PER_DAY = 1200000;
    static MS_PER_HOUR = 50000;
    static TICKS_PER_HOUR = 6;
    static MINUTES_PER_TICK = 10;
    static MINUTES_PER_HOUR = 60;
    static HOURS_PER_DAY = 24;
    static DAYS_PER_MONTH = 31;
    static MONTHS_PER_YEAR = 12;
    static MS_PER_SB_TICK = Time.MS_PER_HOUR / Time.TICKS_PER_HOUR;
    SB_EPOCH;
    time;
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
    get(date) {
        if (!date)
            throw new DcbError(DcbErrorCodes.MissingArgument, 'date');
        const poch = date.getTime() - Time.SB_EPOCH_MS;
        const sbYear = Math.floor(poch / Time.MS_PER_YEAR) + 1;
        const sbMonth = Math.floor(poch / Time.MS_PER_MONTH) % Time.MONTHS_PER_YEAR;
        const sbDay = Math.floor(poch / Time.MS_PER_DAY) % Time.DAYS_PER_MONTH;
        const hour = Math.floor(poch / Time.MS_PER_HOUR) % Time.HOURS_PER_DAY;
        const minute = Math.floor(Time.TICKS_PER_HOUR * poch / Time.MS_PER_HOUR) % Time.TICKS_PER_HOUR;
        const day = this.ordinal(sbDay + 1);
        const month = sbMonths[sbMonth];
        const year = sbYear;
        const string = this.ampm(hour, minute);
        return {
            day,
            month,
            year,
            string,
            hour,
            minute,
            poch,
            toUnix() {
                return Time.toUnixFrom(this);
            }
        };
    }
    /**
     * Calculates the SkyBlockTime based on the given Date and returns the Unix timestamp (seconds).
     * @returns The calculated Unix timestamp (seconds).
     * */
    static toUnixFrom(t) {
        return Math.floor((Time.SB_EPOCH_MS +
            (t.year - 1) * Time.MS_PER_YEAR +
            (t.month - 1) * Time.MS_PER_MONTH +
            (t.day - 1) * Time.MS_PER_DAY +
            t.hour * Time.MS_PER_HOUR +
            t.minute * Time.MS_PER_SB_TICK) / 1000);
    }
    ordinal(n) {
        const v = n % 100;
        return n + ((v - 20) % 1);
    }
    ampm(h, m) {
        const s = ['am', 'pm'];
        const suffix = s[Math.floor(h / 12)];
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
    on(eventName, listener) {
        if (!eventName)
            throw new DcbError(DcbErrorCodes.MissingArgument, 'eventName');
        if (typeof eventName !== 'string')
            throw new DcbTypeError(DcbErrorCodes.InvalidType, 'eventName', 'string');
        if (!listener)
            throw new DcbError(DcbErrorCodes.MissingArgument, 'listener');
        super.on(eventName, listener);
        if (eventName === 'change' && this.listenerCount('change') === 1) {
            this.scheduleNextChange();
        }
        return this;
    }
    scheduleNextChange() {
        const ms = this.msUntilNextChange();
        setTimeout(() => {
            this.checkTime();
            this.scheduleNextChange();
        }, ms);
    }
    msUntilNextChange() {
        const now = Date.now();
        const msSinceEpoch = now - Time.SB_EPOCH_MS;
        return Time.MS_PER_SB_TICK - (msSinceEpoch % Time.MS_PER_SB_TICK);
    }
    checkTime() {
        const sbTime = this.get(new Date());
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
    recalculate(sbTime, sbMinutes, negative = false) {
        if (!sbTime)
            throw new DcbError(DcbErrorCodes.MissingArgument, 'sbTime');
        if (typeof sbTime !== 'object')
            throw new DcbTypeError(DcbErrorCodes.InvalidType, 'sbTime', 'object');
        const totalMinutes = sbTime.hour * Time.MINUTES_PER_HOUR +
            sbTime.minute * Time.MINUTES_PER_TICK +
            (negative ? -sbMinutes : sbMinutes);
        const minutesPerDay = Time.HOURS_PER_DAY * Time.MINUTES_PER_HOUR;
        const dayCarry = Math.floor(totalMinutes / minutesPerDay);
        const remaining = totalMinutes - dayCarry * minutesPerDay; // immer 0..1439
        sbTime.day += dayCarry;
        sbTime.hour = Math.floor(remaining / Time.MINUTES_PER_HOUR);
        sbTime.minute = Math.floor((remaining % Time.MINUTES_PER_HOUR) / Time.MINUTES_PER_TICK);
        sbTime = this.adjustTime(sbTime);
        sbTime.string = this.ampm(sbTime.hour, sbTime.minute);
        sbTime.poch = Math.floor(sbTime.day * Time.MS_PER_DAY +
            sbTime.month * Time.MS_PER_MONTH +
            (sbTime.year - 1) * Time.MS_PER_YEAR +
            sbTime.hour * Time.MS_PER_HOUR +
            sbTime.minute * Time.MS_PER_SB_TICK);
        sbTime.toUnix = function () {
            return Time.toUnixFrom(this);
        };
        return sbTime;
    }
    adjustTime(sbTime) {
        while (sbTime.day <= 0 || sbTime.day > Time.DAYS_PER_MONTH) {
            if (sbTime.day <= 0) {
                sbTime.day += Time.DAYS_PER_MONTH;
                sbTime.month--;
                if (sbTime.month <= 0) {
                    sbTime.month = Time.MONTHS_PER_YEAR;
                    sbTime.year--;
                }
            }
            else {
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
