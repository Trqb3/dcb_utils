'use strict';

const EventEmitter = require('events');
const Options = require('../util/Options');
const { DcbError, DcbTypeError } = require('../errors/DcbError');
const ErrorCodes = require('../errors/ErrorCodes');

/**
 * Der Skyblock EPOCH Timestamp
 * */
const SB_EPOCH = 1560275700000;

/**
 * Definierung der Skyblock Monate und deren zugewiesenen Zahlen
 * */
const SbMonth = {
    EarlySpring: 1,
    Spring: 2,
    LateSpring: 3,
    EarlySummer: 4,
    Summer: 5,
    LateSummer: 6,
    EarlyAutumn: 7,
    Autumn: 8,
    LateAutumn: 9,
    EarlyWinter: 10,
    Winter: 11,
    LateWinter: 12
};
const sbMonths = [
    SbMonth.EarlySpring,
    SbMonth.Spring,
    SbMonth.LateSpring,
    SbMonth.EarlySummer,
    SbMonth.Summer,
    SbMonth.LateSummer,
    SbMonth.EarlyAutumn,
    SbMonth.Autumn,
    SbMonth.LateAutumn,
    SbMonth.EarlyWinter,
    SbMonth.Winter,
    SbMonth.LateWinter
];

class Time extends EventEmitter {
    constructor() {
        super();
        this.time = this.get(new Date());
    }

    on(eventName, listener) {
        if (!eventName) throw new DcbError(ErrorCodes.MissingArgument, 'eventName');
        if (typeof eventName !== 'string') throw new DcbTypeError(ErrorCodes.InvalidType, 'eventName', 'string');

        if (!listener) throw new DcbError(ErrorCodes.MissingArgument, 'listener');

        super.on(eventName, listener);
        if (eventName === 'change' && this.listenerCount('change') === 1) {
            this.#scheduleNextChange();
        }
    }

    /**
     * Kann die Skyblock Zeit anhand einer mitgegebenen Zeit berechnen
     * @param {Date} date Zeit welche benutzt werden soll, um die Skyblock Zeit zu berechnen
     * @returns {SbTimeFormat} Skyblock zeit
     * @example
     * const time = sbt.get(new Date());
     * */
    get(date) {
        if (!date) throw new DcbError(ErrorCodes.MissingArgument, 'date');

        const poch = date.getTime() - SB_EPOCH;
        const sbYear = Math.floor(poch / 446400000) + 1;
        const sbMonth = Math.floor(poch / 37200000) % 12;
        const sbDay = Math.floor(poch / 1200000) % 31;
        const hour = Math.floor(poch / 50000) % 24;
        const minute = Math.floor(6 * poch / 50000) % 6;

        const day = this.#ordinal(sbDay + 1);
        const month = sbMonths[sbMonth];
        const year = sbYear;
        const string = this.#ampm(hour, minute);

        return { day, month, year, string, hour, minute, poch };
    }

    /**
     * Berechnet den Ordinalen Wert eines Wertes
     * @param {number} n Wert
     * @returns {number} Ordinaler Wert
     * */
    #ordinal(n) {
        const v = n % 100;
        return n + ((v - 20) % 1);
    }

    /**
     * Wandelt das 24 Stunden Format in ein 12 Stunden Format um
     * @param {number} h Stunde
     * @param {number} m Minute
     * @returns {string} Uhrzeit im Format HH:MM
     * */
    #ampm(h, m) {
        const s = ['am', 'pm'];
        const suffix = s[Math.floor(h / 12)];
        h = h % 12;
        if (h === 0) {
            h = 12;
        }
        return `${h}:${m}0${suffix}`;
    }

    /**
     * Berechnet die nächste Änderung der Skyblock Zeit in Millisekunden
     * @returns {number} Millisekunden bis zur nächsten Änderung
     * */
    #msUntilNextChange() {
        const now = new Date();
        return (10 - (now.getSeconds() % 10)) * 1000 - now.getMilliseconds();
    }

    /**
     * Ist der Trigger, welche eine kontinuierliche Überprüfung der Zeit startet
     * @returns {void}
     * */
    #scheduleNextChange() {
        const ms = this.#msUntilNextChange();
        setTimeout(() => {
            this.#checkTime();
            this.#scheduleNextChange();
        }, ms);
    }

    /**
     * Dient zur Überprüfung, ob sich die Skyblock Zeit wirklich geändert hat, damit keine Doppelten ergebnisse zurückgegeben werden
     * @returns {void}
     * */
    #checkTime() {
        const sbTime = this.get(new Date());
        if (sbTime.string !== this.time.string) {
            this.time = sbTime;
            this.emit('change', sbTime);
        }
    }


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
    recalculate(sbTime, sbMinutes, negative = false) {
        if (!sbTime) throw new DcbError(ErrorCodes.MissingArgument, 'sbTime');
        if (typeof sbTime !== 'object') throw new DcbTypeError(ErrorCodes.InvalidType, 'sbTime', 'object');

        const totalMinutes = sbTime.hour * 60 + sbTime.minute + (negative ? -sbMinutes : sbMinutes);

        sbTime.hour = Math.floor((totalMinutes / 60) % 24);
        sbTime.minute = (totalMinutes % 60 + 60) % 60;

        if (totalMinutes < 0 && sbTime.minute > 0) {
            sbTime.hour--;
        }

        sbTime.day += Math.floor(totalMinutes / (24 * 60));

        sbTime = this.#adjustTime(sbTime);

        sbTime.string = this.#ampm(sbTime.hour, sbTime.minute);

        sbTime.poch = Math.floor(sbTime.day * 1200000 + sbTime.month * 37200000 + (sbTime.year - 1) * 446400000 + sbTime.hour * 50000 + sbTime.minute * 50000 / 6);

        return sbTime;
    }

    /**
     * Durch das Hinzufügen oder Abziehen von Tagen, Stunden und Minuten wird die Skyblock Zeit falsch berechnet. Diese Funktion korrigiert die Skyblock Zeit.
     * @param {SbTimeFormat} sbTime Skyblock Zeit
     * @returns {SbTimeFormat} Skyblock Zeit
     * */
    #adjustTime(sbTime) {
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

module.exports = Time;