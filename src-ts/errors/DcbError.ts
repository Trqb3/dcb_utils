import util from "node:util";

/**
 * Extends an error class to include a code property and a custom message.
 * @param Base The base error class to extend.
 * @returns The extended error class.
 * */
function makeDcbError(Base: ErrorConstructor) {
    return class DcbError extends Base {
        public code: string;

        constructor(code: ErrorCodes, ...args: any[]) {
            const msg: string = message(code, args);
            super(msg);
            this.code = code;
            Error.captureStackTrace?.(this, DcbError);
        }

        get name(): string {
            return `${super.name} [${this.code}]`;
        }
    }
}

/**
 * Formats a message with the provided arguments.
 * @param code The error code.
 * @param args The arguments to format the message with.
 * @returns The formatted message.
 * */
function message(code: ErrorCodes, args: any): string {
    if (!(code in ErrorCodes)) throw new Error('Error code must be a valid DcbErrorCodes');
    const msg: string = Messages[code];
    if (!msg) throw new Error(`No message associated with error code: ${code}.`);
    if (!args?.length) return msg;
    args.unshift(msg);
    return util.format(...args);
}

/**
 * The error codes for DcbError.
 * */
export enum ErrorCodes {
    InvalidType = 'InvalidType',
    MissingArgument = 'MissingArgument',

    NotReady = 'NotReady',

    FailedCall = 'FailedCall',
}

/**
 * The messages for the corresponding ErrorCode.
 * */
const Messages = {
    [ErrorCodes.InvalidType]: 'Provided type is invalid',
    [ErrorCodes.MissingArgument]: 'Missing required argument',

    [ErrorCodes.NotReady]: 'Not ready',

    [ErrorCodes.FailedCall]: 'Failed to call function',
}

export class DcbError extends makeDcbError(Error) {}
export class DcbTypeError extends makeDcbError(TypeError) {}
export class DcbRangeError extends makeDcbError(RangeError) {}