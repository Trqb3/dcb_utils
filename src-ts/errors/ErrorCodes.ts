/**
 * The error codes for DcbError.
 * */
export enum ErrorCodes {
    InvalidType = 'InvalidType',
    InvalidInput = 'InvalidInput',
    MissingArgument = 'MissingArgument',
    MissingEnv = 'MissingEnv',

    DbNotReady = 'DbNotReady',
    DbAuthFailed = 'DbAuthFailed',
    DbConnectionFailed = 'DbConnectionFailed',

    FailedCall = 'FailedCall',
}