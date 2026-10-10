import { InspectOptions } from 'util';
import { LoggerService, LogLevel } from './logger.service.js';
/**
 * @publicApi
 */
export interface ConsoleLoggerOptions {
    /**
     * Enabled log levels.
     * When not set, the levels are read from the `NEST_LOG_LEVEL` environment
     * variable (e.g. `warn`, `>=debug` or `warn,error`) the first time the
     * logger checks a level. Without it, every level is enabled.
     */
    logLevels?: LogLevel[];
    /**
     * If enabled, will print timestamp (time difference) between current and previous log message.
     * Note: This option is not used when `json` is enabled.
     */
    timestamp?: boolean;
    /**
     * A prefix to be used for each log message.
     * Note: This option is not used when `json` is enabled.
     */
    prefix?: string;
    /**
     * If enabled, will print the log message in JSON format.
     */
    json?: boolean;
    /**
     * If enabled, will print the log message in color.
     * Default true if json is disabled, false otherwise
     */
    colors?: boolean;
    /**
     * The context of the logger.
     */
    context?: string;
    /**
     * If enabled, will force the use of console.log/console.error instead of process.stdout/stderr.write.
     * This is useful for test environments like Jest that can buffer console calls.
     * @default false
     */
    forceConsole?: boolean;
    /**
     * If enabled, will print the log message in a single line, even if it is an object with multiple properties.
     * If set to a number, the most n inner elements are united on a single line as long as all properties fit into breakLength. Short array elements are also grouped together.
     * Default true when `json` is enabled, false otherwise.
     */
    compact?: boolean | number;
    /**
     * Specifies the maximum number of Array, TypedArray, Map, Set, WeakMap, and WeakSet elements to include when formatting.
     * Set to null or Infinity to show all elements. Set to 0 or negative to show no elements.
     * Ignored when `json` is enabled, colors are disabled, and `compact` is set to true as it produces a parseable JSON output.
     * @default 100
     */
    maxArrayLength?: number;
    /**
     * Specifies the maximum number of characters to include when formatting.
     * Set to null or Infinity to show all elements. Set to 0 or negative to show no characters.
     * Ignored when `json` is enabled, colors are disabled, and `compact` is set to true as it produces a parseable JSON output.
     * @default 10000.
     */
    maxStringLength?: number;
    /**
     * If enabled, will sort keys while formatting objects.
     * Can also be a custom sorting function.
     * Ignored when `json` is enabled, colors are disabled, and `compact` is set to true as it produces a parseable JSON output.
     * @default false
     */
    sorted?: boolean | ((a: string, b: string) => number);
    /**
     * Specifies the number of times to recurse while formatting object.
     * This is useful for inspecting large objects. To recurse up to the maximum call stack size pass Infinity or null.
     * Ignored when `json` is enabled, colors are disabled, and `compact` is set to true as it produces a parseable JSON output.
     * @default 5
     */
    depth?: number;
    /**
     * If true, object's non-enumerable symbols and properties are included in the formatted result.
     * WeakMap and WeakSet entries are also included as well as user defined prototype properties
     * @default false
     */
    showHidden?: boolean;
    /**
     * The length at which input values are split across multiple lines. Set to Infinity to format the input as a single line (in combination with "compact" set to true).
     * Default Infinity when "compact" is true, 80 otherwise.
     * Ignored when `json` is enabled, colors are disabled, and `compact` is set to true as it produces a parseable JSON output.
     */
    breakLength?: number;
    /**
     * If enabled, plain objects passed after the message are treated as structured
     * metadata (params) attached to the log entry, instead of being logged as
     * separate messages.
     * @default true
     */
    structuredParams?: boolean;
    /**
     * When true and `json` mode is enabled, structured params are spread into the root JSON object
     * instead of being nested under a `params` key.
     * Requires `structuredParams` to be enabled.
     * @default false
     */
    flattenParams?: boolean;
    /**
     * Properties to mask in logged values, as key names (`'password'`, matched
     * at any depth) or dotted paths (`'user.password'`, matched by the last
     * keys leading to the property, at any depth). Keys are compared
     * case-insensitively, and array indices are skipped.
     * Applies to structured params and to messages that are not strings
     * (objects, arrays, errors), in text and JSON mode. String messages, the
     * error message and the stack trace are printed as is.
     * The logged values are not mutated: only the objects that contain a
     * matching property are copied.
     * Pass an object to replace the default censor (`"[REDACTED]"`).
     */
    redact?: string[] | {
        paths: string[];
        censor?: string;
    };
}
/**
 * @publicApi
 */
export declare class ConsoleLogger implements LoggerService {
    /**
     * The options of the logger.
     */
    protected options: ConsoleLoggerOptions;
    /**
     * The context of the logger (can be set manually or automatically inferred).
     */
    protected context?: string;
    /**
     * The original context of the logger (set in the constructor).
     */
    protected originalContext?: string;
    /**
     * The options used for the "inspect" method.
     */
    protected inspectOptions: InspectOptions;
    /**
     * The last timestamp at which the log message was printed.
     */
    protected static lastTimestampAt?: number;
    /**
     * Masks the properties set in the `redact` option.
     */
    private readonly redactor?;
    constructor();
    constructor(context: string);
    constructor(options: ConsoleLoggerOptions);
    constructor(context: string, options: ConsoleLoggerOptions);
    /**
     * Write a 'log' level log, if the configured level allows for it.
     * Prints to `stdout` with newline.
     */
    log(message: any, context?: string): void;
    log(message: any, ...optionalParams: [...any, string?]): void;
    /**
     * Write an 'error' level log, if the configured level allows for it.
     * Prints to `stderr` with newline.
     */
    error(message: any, stackOrContext?: string): void;
    error(message: any, stack?: string, context?: string): void;
    error(message: any, ...optionalParams: [...any, string?, string?]): void;
    /**
     * Write a 'warn' level log, if the configured level allows for it.
     * Prints to `stdout` with newline.
     */
    warn(message: any, context?: string): void;
    warn(message: any, ...optionalParams: [...any, string?]): void;
    /**
     * Write a 'debug' level log, if the configured level allows for it.
     * Prints to `stdout` with newline.
     */
    debug(message: any, context?: string): void;
    debug(message: any, ...optionalParams: [...any, string?]): void;
    /**
     * Write a 'verbose' level log, if the configured level allows for it.
     * Prints to `stdout` with newline.
     */
    verbose(message: any, context?: string): void;
    verbose(message: any, ...optionalParams: [...any, string?]): void;
    /**
     * Write a 'fatal' level log, if the configured level allows for it.
     * Prints to `stderr` with newline.
     */
    fatal(message: any, stackOrContext?: string): void;
    fatal(message: any, stack?: string, context?: string): void;
    fatal(message: any, ...optionalParams: [...any, string?, string?]): void;
    /**
     * Set log levels
     * @param levels log levels
     */
    setLogLevels(levels: LogLevel[]): void;
    /**
     * Set logger context
     * @param context context
     */
    setContext(context: string): void;
    /**
     * Resets the logger context to the value that was passed in the constructor.
     */
    resetContext(): void;
    isLevelEnabled(level: LogLevel): boolean;
    /**
     * Returns the levels used when none were passed to the constructor: the
     * `NEST_LOG_LEVEL` environment variable if it is set, every level otherwise.
     * Called on the first level check rather than in the constructor, so that
     * the default logger also sees variables loaded after "@nestjs/common" was
     * imported (for example, from a `.env` file).
     */
    protected getDefaultLogLevels(): LogLevel[];
    protected getTimestamp(): string;
    protected printMessages(messages: unknown[], context?: string, logLevel?: LogLevel, writeStreamType?: 'stdout' | 'stderr', errorStack?: unknown, params?: Record<string, any>): void;
    protected printAsJson(message: unknown, options: {
        context: string;
        logLevel: LogLevel;
        writeStreamType?: 'stdout' | 'stderr';
        errorStack?: unknown;
        params?: Record<string, any>;
        error?: Error;
    }): void;
    protected getJsonLogObject(message: unknown, options: {
        context: string;
        logLevel: LogLevel;
        writeStreamType?: 'stdout' | 'stderr';
        errorStack?: unknown;
        params?: Record<string, any>;
        error?: Error;
    }): {
        [key: string]: unknown;
        level: LogLevel;
        pid: number;
        timestamp: number;
        message: unknown;
        context?: string;
        stack?: unknown;
        error?: Record<string, unknown>;
        params?: Record<string, any>;
    };
    /**
     * Pulls the first `Error` out of the messages so that it can be attached to
     * the log record as a structured `error` field instead of being printed as
     * a separate record. When the error is the message itself, the record's
     * message becomes the error's message.
     */
    protected extractJsonError(messages: unknown[]): {
        messages: unknown[];
        error?: Error;
    };
    /**
     * Converts an error into a plain object: `name`, `message`, `stack`, own
     * primitive properties (e.g. `code`), and, recursively, `cause` and the
     * `errors` of an `AggregateError`, up to a fixed depth.
     */
    protected serializeError(error: Error, depth?: number, ancestors?: Set<Error>): Record<string, unknown>;
    /**
     * Masks the properties set in the `redact` option. Returns the value itself
     * when the option isn't set or nothing matched.
     */
    protected redact(value: unknown): unknown;
    protected formatPid(pid: number): string;
    protected formatContext(context: string): string;
    protected formatMessage(logLevel: LogLevel, message: unknown, pidMessage: string, formattedLogLevel: string, contextMessage: string, timestampDiff: string, params?: Record<string, any>): string;
    protected stringifyParams(params: Record<string, any>): string;
    /**
     * Resolves a message passed as a function: a class resolves to its name,
     * any other function is called (lazy message) and its result re-resolved.
     */
    protected resolveMessage(message: unknown): unknown;
    protected stringifyMessage(message: unknown, logLevel: LogLevel): string;
    protected colorize(message: string, logLevel: LogLevel): string;
    protected printStackTrace(stack: string): void;
    protected updateAndGetTimestampDiff(): string;
    protected formatTimestampDiff(timestampDiff: number): string;
    protected getInspectOptions(): InspectOptions;
    /**
     * Serializes a JSON log object without ever throwing: circular references
     * are replaced with "[Circular]", and a value that cannot be serialized
     * (e.g. a throwing `toJSON()`) makes the whole record fall back to `inspect`.
     */
    protected stringifyJsonLogObject(logObject: Record<string, unknown>): string;
    protected stringifyReplacer(key: string, value: unknown): unknown;
    protected getContextAndMessagesToPrint(args: unknown[]): {
        messages: unknown[];
        context: string | undefined;
        params?: undefined;
    } | {
        messages: unknown[];
        context: string | undefined;
        params: any;
    };
    protected getContextAndStackAndMessagesToPrint(args: unknown[]): {
        messages: unknown[];
        stack: string;
        context: string | undefined;
        params?: undefined;
    } | {
        messages: unknown[];
        context: string | undefined;
        params?: undefined;
        stack?: undefined;
    } | {
        messages: unknown[];
        context: string | undefined;
        params: any;
        stack?: undefined;
    } | {
        stack: string | undefined;
        messages: unknown[];
        context: string | undefined;
        params: any;
    };
    protected isStackFormat(stack: unknown): boolean;
    protected getColorByLogLevel(level: LogLevel): (text: string) => string;
}
