'use strict';

const Options = require('../util/Options');
const { DcbError, DcbTypeError, ErrorCodes } = require('../errors');
const SkyblockTime = require('./Time');

class SkyblockEvents {
    /**
     * @param {EventConfig} config Konfiguration für ein Event
     * */
    constructor(config) {
        if (!config) throw new DcbError(ErrorCodes.MissingArgument, 'config');

        this.config = config;
    }

    /**
     * Funktion dient zur überprüfung, ob zur angegebenen Skyblock Zeit ein Skyblock Event stattfindet
     * @param {SbTimeFormat} sbTime Skyblock Zeit
     * @param {boolean} negative Soll die Zeit subtrahiert oder addiert werden?
     * @returns {boolean} Soll das Event gepingt werden?
     * @example
     * const ping = event.check(sbt.get(new Date()));
     * */
    check(sbTime, negative = false) {
        if (!sbTime) throw new DcbError(ErrorCodes.MissingArgument, 'sbTime');
        if (typeof sbTime !== 'object') throw new DcbTypeError(ErrorCodes.MissingArgument, 'sbTime', 'object');

        if (typeof negative !== 'boolean') throw new DcbTypeError(ErrorCodes.MissingArgument, 'negative', 'boolean');

        const sbt = new SkyblockTime();
        const notifySbTime = sbt.recalculate(sbTime, this.config.pre_ping, negative);

        const matches = [
            this.config.day === undefined || this.config.day === notifySbTime.day,
            this.config.month === undefined || this.config.month === notifySbTime.month,
            this.config.year === undefined || this.config.year === notifySbTime.year,
            this.config.hour === undefined || this.config.hour === notifySbTime.hour,
            this.config.minute === undefined || this.config.minute === notifySbTime.minute
        ];

        return matches.every(Boolean);
    }
}

module.exports = SkyblockEvents;