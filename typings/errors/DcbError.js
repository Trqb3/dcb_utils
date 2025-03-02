'use strict';
const util = require("node:util");
const ErrorCodes = require('../errors/ErrorCodes');
const Messages = require('../errors/Messages');
/**
 * Erweitert einen Fehler in einen DcbError.
 * @param {Error} Base Base Fehler erweitert
 * @returns {DcbError}
 * @ignore
 * */
function makeDcbError(Base) {
    return class DcbError extends Base {
        constructor(code, ...args) {
            var _a;
            const msg = message(code, args);
            super(msg);
            this.code = code;
            (_a = Error.captureStackTrace) === null || _a === void 0 ? void 0 : _a.call(Error, this, DcbError);
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
    if (!(code in ErrorCodes))
        throw new Error('Error code must be a valid DcbErrorCodes');
    const msg = Messages[code];
    if (!msg)
        throw new Error(`No message associated with error code: ${code}.`);
    if (typeof msg === 'function')
        return msg(...args);
    if (!(args === null || args === void 0 ? void 0 : args.length))
        return msg;
    args.unshift(msg);
    return util.format(...args);
}
class DcbError extends makeDcbError(Error) {
}
class DcbTypeError extends makeDcbError(TypeError) {
}
class DcbRangeError extends makeDcbError(RangeError) {
}
module.exports = { DcbError, DcbTypeError, DcbRangeError };
