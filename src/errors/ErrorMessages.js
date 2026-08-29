"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessages = void 0;
const ErrorCodes_1 = require("./ErrorCodes");
/**
 * The messages for the corresponding ErrorCode.
 * */
exports.ErrorMessages = {
    [ErrorCodes_1.ErrorCodes.InvalidType]: 'Provided type is invalid',
    [ErrorCodes_1.ErrorCodes.MissingArgument]: 'Missing required argument',
    [ErrorCodes_1.ErrorCodes.MissingEnv]: 'Missing required environment variable',
    [ErrorCodes_1.ErrorCodes.NotReady]: 'Not ready',
    [ErrorCodes_1.ErrorCodes.FailedCall]: 'Failed to call function',
};
