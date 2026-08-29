/**
 * The error codes for DcbError.
 * */
export declare enum ErrorCodes {
    InvalidType = "InvalidType",
    MissingArgument = "MissingArgument",
    NotReady = "NotReady",
    FailedCall = "FailedCall"
}
declare const DcbError_base: {
    new (code: ErrorCodes, ...args: any[]): {
        code: string;
        readonly name: string;
        message: string;
        stack?: string;
        cause?: unknown;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
export declare class DcbError extends DcbError_base {
}
declare const DcbTypeError_base: {
    new (code: ErrorCodes, ...args: any[]): {
        code: string;
        readonly name: string;
        message: string;
        stack?: string;
        cause?: unknown;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
export declare class DcbTypeError extends DcbTypeError_base {
}
declare const DcbRangeError_base: {
    new (code: ErrorCodes, ...args: any[]): {
        code: string;
        readonly name: string;
        message: string;
        stack?: string;
        cause?: unknown;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
export declare class DcbRangeError extends DcbRangeError_base {
}
export {};
