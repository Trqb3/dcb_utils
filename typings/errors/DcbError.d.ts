import { ErrorCodes } from "./ErrorCodes";
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
export { ErrorCodes as DcbErrorCodes } from "./ErrorCodes";
export { ErrorMessages as DcbErrorMessages } from "./ErrorMessages";
