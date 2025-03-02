export const Database: typeof import("./database/Database");
export const SkyblockTime: typeof import("./skyblock/Time");
export const SkyblockEvents: typeof import("./skyblock/Events");
export const EventHandler: typeof import("./discord/EventHandler");
export const DcbError: typeof import("./errors/DcbError").DcbError;
export const DcbTypeError: typeof import("./errors/DcbError").DcbTypeError;
export const DcbRangeError: typeof import("./errors/DcbError").DcbRangeError;
export const ErrorCodes: import("./errors/ErrorCodes").DcbErrorCodes;
export const ErrorMessages: {
    InvalidType: string;
    MissingArgument: string;
    NotReady: string;
    FailedCall: string;
};
export const Files: typeof import("./util/Files");
export const Logger: typeof import("./util/Logger");
