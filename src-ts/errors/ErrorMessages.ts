import { ErrorCodes } from './ErrorCodes';

/**
 * The messages for the corresponding ErrorCode.
 * */
export const ErrorMessages: Record<ErrorCodes, string> = {
    [ErrorCodes.InvalidType]: 'Provided type is invalid',
    [ErrorCodes.MissingArgument]: 'Missing required argument',
    [ErrorCodes.MissingEnv]: 'Missing required environment variable',

    [ErrorCodes.NotReady]: 'Not ready',

    [ErrorCodes.FailedCall]: 'Failed to call function',
}