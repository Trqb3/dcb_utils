import { ErrorCodes } from './ErrorCodes';

/**
 * The messages for the corresponding ErrorCode.
 * */
export const ErrorMessages: Record<ErrorCodes, string> = {
    [ErrorCodes.InvalidType]: 'Provided type is invalid',
    [ErrorCodes.InvalidInput]: 'Invalid input',
    [ErrorCodes.MissingArgument]: 'Missing required argument',
    [ErrorCodes.MissingEnv]: 'Missing required environment variable',

    [ErrorCodes.DbNotReady]: 'Database is not ready',
    [ErrorCodes.DbAuthFailed]: 'Database authentication failed',
    [ErrorCodes.DbConnectionFailed]: 'Database connection failed',

    [ErrorCodes.FailedCall]: 'Failed to call function',
}