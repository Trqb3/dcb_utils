"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DcbErrorMessages = exports.DcbErrorCodes = exports.DcbRangeError = exports.DcbTypeError = exports.DcbError = void 0;
const node_util_1 = __importDefault(require("node:util"));
const ErrorCodes_1 = require("./ErrorCodes");
const ErrorMessages_1 = require("./ErrorMessages");
/**
 * Extends an error class to include a code property and a custom message.
 * @param Base The base error class to extend.
 * @returns The extended error class.
 * */
function makeDcbError(Base) {
    return class DcbError extends Base {
        code;
        constructor(code, ...args) {
            const msg = message(code, args);
            super(msg);
            this.code = code;
            Error.captureStackTrace?.(this, DcbError);
        }
        get name() {
            return `${super.name} [${this.code}]`;
        }
    };
}
/**
 * Formats a message with the provided arguments.
 * @param code The error code.
 * @param args The arguments to format the message with.
 * @returns The formatted message.
 * */
function message(code, args) {
    if (!(code in ErrorCodes_1.ErrorCodes))
        throw new Error('Error code must be a valid DcbErrorCodes');
    const msg = ErrorMessages_1.ErrorMessages[code];
    if (!msg)
        throw new Error(`No message associated with error code: ${code}.`);
    if (!args?.length)
        return msg;
    args.unshift(msg);
    return node_util_1.default.format(...args);
}
class DcbError extends makeDcbError(Error) {
}
exports.DcbError = DcbError;
class DcbTypeError extends makeDcbError(TypeError) {
}
exports.DcbTypeError = DcbTypeError;
class DcbRangeError extends makeDcbError(RangeError) {
}
exports.DcbRangeError = DcbRangeError;
var ErrorCodes_2 = require("./ErrorCodes");
Object.defineProperty(exports, "DcbErrorCodes", { enumerable: true, get: function () { return ErrorCodes_2.ErrorCodes; } });
var ErrorMessages_2 = require("./ErrorMessages");
Object.defineProperty(exports, "DcbErrorMessages", { enumerable: true, get: function () { return ErrorMessages_2.ErrorMessages; } });
