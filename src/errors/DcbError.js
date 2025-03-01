'use strict';

const ErrorCodes = require('./ErrorCodes');
const Messages = require('./Messages');

/**
 * Erweitert einen Fehler in einen DcbError.
 * @param {Error} Base Base Fehler erweitert
 * @returns {DcbError}
 * @ignore
 * */
function makeDcbError(Base) {
    return class DcbError extends Base {
        constructor(code, ...args) {
            super(message(code, args));
            this.code = code;
            Error.captureStackTrace?.(this, DcbError);
        }

        get name() {
            return `${super.name} [${this.code}]`;
        }
    };
}

/**
 * Formatiert die Nachricht für einen Fehler
 * @param {string} code Der Fehler Code
 * @param {Array<*>} args Argumente zum Übergeben für util format oder als Funktionsargumente
 * @returns {string} Formatierte Zeichenfolge
 * @ignore
 * */
function message(code, args) {
    if (!(code in ErrorCodes)) throw new Error('Error code must be a valid DcbErrorCodes');
    const msg = Messages[code];
    if (!msg) throw new Error(`No message associated with error code: ${code}.`);
    if (typeof msg === 'function') return msg(...args);
    if (!args?.length) return msg;
    args.unshift();
    return String(...args);
}

module.exports = {
    DcbError: makeDcbError(Error),
    DcbTypeError: makeDcbError(TypeError),
    DcbRangeError: makeDcbError(RangeError),
}