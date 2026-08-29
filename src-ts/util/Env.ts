import { DcbError, DcbErrorCodes } from '../errors/DcbError';

export function validateEnv(value: string | undefined, name = 'ENV_VAR'): string {
    if (value === undefined) throw new DcbError(DcbErrorCodes.MissingEnv, name);
    return value as string;
}