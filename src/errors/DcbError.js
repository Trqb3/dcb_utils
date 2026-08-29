"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DcbRangeError = exports.DcbTypeError = exports.DcbError = exports.ErrorCodes = void 0;
const node_util_1 = __importDefault(require("node:util"));
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
    if (!(code in ErrorCodes))
        throw new Error('Error code must be a valid DcbErrorCodes');
    const msg = Messages[code];
    if (!msg)
        throw new Error(`No message associated with error code: ${code}.`);
    if (!args?.length)
        return msg;
    args.unshift(msg);
    return node_util_1.default.format(...args);
}
/**
 * The error codes for DcbError.
 * */
var ErrorCodes;
(function (ErrorCodes) {
    ErrorCodes["InvalidType"] = "InvalidType";
    ErrorCodes["MissingArgument"] = "MissingArgument";
    ErrorCodes["MissingEnv"] = "MissingEnv";
    ErrorCodes["NotReady"] = "NotReady";
    ErrorCodes["FailedCall"] = "FailedCall";
})(ErrorCodes || (exports.ErrorCodes = ErrorCodes = {}));
/**
 * The messages for the corresponding ErrorCode.
 * */
const Messages = {
    [ErrorCodes.InvalidType]: 'Provided type is invalid',
    [ErrorCodes.MissingArgument]: 'Missing required argument',
    [ErrorCodes.MissingEnv]: 'Missing required environment variable',
    [ErrorCodes.NotReady]: 'Not ready',
    [ErrorCodes.FailedCall]: 'Failed to call function',
};
class DcbError extends makeDcbError(Error) {
}
exports.DcbError = DcbError;
class DcbTypeError extends makeDcbError(TypeError) {
}
exports.DcbTypeError = DcbTypeError;
class DcbRangeError extends makeDcbError(RangeError) {
}
exports.DcbRangeError = DcbRangeError;
