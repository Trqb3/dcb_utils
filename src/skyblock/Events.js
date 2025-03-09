'use strict';

const Options = require('../util/Options');
const { DcbError, DcbTypeError } = require('../errors/DcbError');
const ErrorCodes = require('../errors/ErrorCodes');

/**
 * Hauptklasse für die Skyblock Events
 * */
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
     * @param {SkyblockTimeFormat} sbTime Skyblock Zeit
     * @param {boolean} negative Soll die Zeit subtrahiert oder addiert werden?
     * @returns {boolean} Soll das Event gepingt werden?
     * @example
     * const ping = event.check(sbt.get(new Date()));
     * */
    check(sbTime, negative = false) {
        if (!sbTime) throw new DcbError(ErrorCodes.MissingArgument, 'sbTime');
        if (typeof sbTime !== 'object') throw new DcbTypeError(ErrorCodes.MissingArgument, 'sbTime', 'object');

        if (typeof negative !== 'boolean') throw new DcbTypeError(ErrorCodes.MissingArgument, 'negative', 'boolean');

        const matches = [
            this.config.day === null || this.config.day === sbTime.day,
            this.config.month === null || this.config.month === sbTime.month,
            this.config.year === null || this.config.year === sbTime.year,
            this.config.hour === null || this.config.hour === sbTime.hour,
            this.config.minute === null || this.config.minute === sbTime.minute
        ];

        return matches.every(Boolean);
    }
}

module.exports = SkyblockEvents;