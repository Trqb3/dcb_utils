"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = void 0;
/**
 * The error codes for DcbError.
 * */
var ErrorCodes;
(function (ErrorCodes) {
    ErrorCodes["InvalidType"] = "InvalidType";
    ErrorCodes["InvalidInput"] = "InvalidInput";
    ErrorCodes["MissingArgument"] = "MissingArgument";
    ErrorCodes["MissingEnv"] = "MissingEnv";
    ErrorCodes["DbNotReady"] = "DbNotReady";
    ErrorCodes["DbAuthFailed"] = "DbAuthFailed";
    ErrorCodes["DbConnectionFailed"] = "DbConnectionFailed";
    ErrorCodes["FailedCall"] = "FailedCall";
})(ErrorCodes || (exports.ErrorCodes = ErrorCodes = {}));
