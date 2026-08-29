"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
const DcbError_1 = require("../errors/DcbError");
function validateEnv(value, name = 'ENV_VAR') {
    if (value === undefined)
        throw new DcbError_1.DcbError(DcbError_1.DcbErrorCodes.MissingEnv, name);
    return value;
}
