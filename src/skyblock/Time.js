"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkyblockMonths = void 0;
const events_1 = require("events");
const DcbError_1 = require("../errors/DcbError");
var SkyblockMonths;
(function (SkyblockMonths) {
    SkyblockMonths[SkyblockMonths["EarlySpring"] = 1] = "EarlySpring";
    SkyblockMonths[SkyblockMonths["Spring"] = 2] = "Spring";
    SkyblockMonths[SkyblockMonths["LateSpring"] = 3] = "LateSpring";
    SkyblockMonths[SkyblockMonths["EarlySummer"] = 4] = "EarlySummer";
    SkyblockMonths[SkyblockMonths["Summer"] = 5] = "Summer";
    SkyblockMonths[SkyblockMonths["LateSummer"] = 6] = "LateSummer";
    SkyblockMonths[SkyblockMonths["EarlyAutumn"] = 7] = "EarlyAutumn";
    SkyblockMonths[SkyblockMonths["Autumn"] = 8] = "Autumn";
    SkyblockMonths[SkyblockMonths["LateAutumn"] = 9] = "LateAutumn";
    SkyblockMonths[SkyblockMonths["EarlyWinter"] = 10] = "EarlyWinter";
    SkyblockMonths[SkyblockMonths["Winter"] = 11] = "Winter";
    SkyblockMonths[SkyblockMonths["LateWinter"] = 12] = "LateWinter";
})(SkyblockMonths || (exports.SkyblockMonths = SkyblockMonths = {}));
const sbMonths = [
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
 * Base class for the Skyblock Time system calculations.
 * */
class Time extends events_1.EventEmitter {
    SB_EPOCH;
    time;
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
    get(date) {
        if (!date)
            throw new DcbError_1.DcbError(DcbError_1.DcbErrorCodes.MissingArgument, 'date');
        const poch = date.getTime() - this.SB_EPOCH;
        const sbYear = Math.floor(poch / 446400000) + 1;
        const sbMonth = Math.floor(poch / 37200000) % 12;
        const sbDay = Math.floor(poch / 1200000) % 31;
        const hour = Math.floor(poch / 50000) % 24;
        const minute = Math.floor(6 * poch / 50000) % 6;
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
                return Math.floor((1560275700000 +
                    (this.year - 1) * 446400000 +
                    (this.month - 1) * 37200000 +
                    (this.day - 1) * 1200000 +
                    this.hour * 50000 +
                    this.minute * 50000 / 6) / 1000);
            }
        };
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
     * Adds a listener to the SkyblockTime instance.
     * @param {string} eventName The name of the event.
     * @param {(arg: SkyblockTime) => void} listener The listener to add.
     * @example
     * sbt.on('change', (time: SkyblockTime): void => console.log(time));
     * @see Time
     * @see Time.get
     * */
    on(eventName, listener) {
        if (!eventName)
            throw new DcbError_1.DcbError(DcbError_1.DcbErrorCodes.MissingArgument, 'eventName');
        if (typeof eventName !== 'string')
            throw new DcbError_1.DcbTypeError(DcbError_1.DcbErrorCodes.InvalidType, 'eventName', 'string');
        if (!listener)
            throw new DcbError_1.DcbError(DcbError_1.DcbErrorCodes.MissingArgument, 'listener');
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
        const MS_PER_SB_MINUTE = 50_000 / 6;
        const msSinceEpoch = now - this.SB_EPOCH;
        return MS_PER_SB_MINUTE - (msSinceEpoch % MS_PER_SB_MINUTE);
    }
    checkTime() {
        const sbTime = this.get(new Date());
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
    recalculate(sbTime, sbMinutes, negative = false) {
        if (!sbTime)
            throw new DcbError_1.DcbError(DcbError_1.DcbErrorCodes.MissingArgument, 'sbTime');
        if (typeof sbTime !== 'object')
            throw new DcbError_1.DcbTypeError(DcbError_1.DcbErrorCodes.InvalidType, 'sbTime', 'object');
        const totalMinutes = sbTime.hour * 60 + sbTime.minute + (negative ? -sbMinutes : sbMinutes);
        sbTime.hour = Math.floor((totalMinutes / 60) % 24);
        sbTime.minute = (totalMinutes % 60 + 60) % 60;
        if (totalMinutes < 0 && sbTime.minute > 0) {
            sbTime.hour--;
        }
        sbTime.day += Math.floor(totalMinutes / (24 * 60));
        sbTime = this.adjustTime(sbTime);
        sbTime.string = this.ampm(sbTime.hour, sbTime.minute);
        sbTime.poch = Math.floor(sbTime.day * 1200000 + sbTime.month * 37200000 + (sbTime.year - 1) * 446400000 + sbTime.hour * 50000 + sbTime.minute * 50000 / 6);
        sbTime.toUnix = function () {
            return Math.floor((1560275700000 +
                (this.year - 1) * 446400000 +
                (this.month - 1) * 37200000 +
                (this.day - 1) * 1200000 +
                this.hour * 50000 +
                this.minute * 50000 / 6) / 1000);
        };
        return sbTime;
    }
    adjustTime(sbTime) {
        while (sbTime.day <= 0 || sbTime.day > 31) {
            if (sbTime.day <= 0) {
                sbTime.day += 31;
                sbTime.month--;
                if (sbTime.month <= 0) {
                    sbTime.month = 12;
                    sbTime.year--;
                }
            }
            else {
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
exports.default = Time;
