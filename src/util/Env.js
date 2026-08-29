"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
const DcbError_1 = require("../errors/DcbError");
/**
 * Validates that an environment variable is defined.
 * @param value The value of the environment variable.
 * @param name The name of the environment variable.
 * @returns The value of the environment variable if it is defined.
 */
function validateEnv(value, name = 'ENV_VAR') {
    if (value === undefined)
        throw new DcbError_1.DcbError(DcbError_1.DcbErrorCodes.MissingEnv, name);
    return value;
}
