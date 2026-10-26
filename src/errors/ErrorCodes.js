/**
 * The error codes for DcbError.
 * */
export var ErrorCodes;
(function (ErrorCodes) {
    ErrorCodes["InvalidType"] = "InvalidType";
    ErrorCodes["InvalidInput"] = "InvalidInput";
    ErrorCodes["MissingArgument"] = "MissingArgument";
    ErrorCodes["MissingEnv"] = "MissingEnv";
    ErrorCodes["DbNotReady"] = "DbNotReady";
    ErrorCodes["DbAuthFailed"] = "DbAuthFailed";
    ErrorCodes["DbConnectionFailed"] = "DbConnectionFailed";
    ErrorCodes["FailedCall"] = "FailedCall";
})(ErrorCodes || (ErrorCodes = {}));
