import { DcbError, DcbErrorCodes } from '../errors/DcbError';
/**
 * Validates that an environment variable is defined.
 * @param value The value of the environment variable.
 * @param name The name of the environment variable.
 * @returns The value of the environment variable if it is defined.
 */
export function validateEnv(value, name = 'ENV_VAR') {
    if (value === undefined)
        throw new DcbError(DcbErrorCodes.MissingEnv, name);
    return value;
}
