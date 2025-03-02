'use strict';
const util = require('util');
/**
 * Formatiert die Nachricht für einen Fehler
 * @param {string} code Der Fehler Code
 * @param {Array<*>} args Argumente zum Übergeben für util.format oder als Funktionsargumente
 * @returns {string} Formatierte Zeichenfolge
 */
function message(code, args) {
    const ErrorCodes = require('./ErrorCodes'); // Lazy-Import
    const Messages = require('./Messages'); // Lazy-Import
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
module.exports = { message };
