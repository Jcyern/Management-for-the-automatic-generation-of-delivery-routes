var ConsoleLogger_1;
import { __decorate, __metadata, __param } from "tslib";
import { inspect } from 'util';
import { Injectable, Optional } from '../decorators/core/index.js';
import { clc, yellow, isColorAllowed } from '../utils/cli-colors.util.js';
import { isFunction, isPlainObject, isString, isUndefined, } from '../utils/shared.utils.js';
import { getEnvLogLevels, LOG_LEVEL_ENV_VAR, } from './utils/get-env-log-levels.util.js';
import { isLogLevelEnabled } from './utils/is-log-level-enabled.util.js';
import { createRedactor } from './utils/redact.util.js';
const DEFAULT_DEPTH = 5;
/**
 * How many levels of nested errors (`cause`, `AggregateError#errors`) are
 * serialized in JSON mode.
 */
const MAX_ERROR_DEPTH = 5;
const DEFAULT_LOG_LEVELS = [
    'log',
    'error',
    'warn',
    'debug',
    'verbose',
    'fatal',
];
/**
 * The last invalid `NEST_LOG_LEVEL` value that was reported, so that loggers
 * sharing the environment warn about it once.
 */
let reportedInvalidEnvLogLevel;
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    day: '2-digit',
    month: '2-digit',
});
/**
 * @publicApi
 */
let ConsoleLogger = class ConsoleLogger {
    static { ConsoleLogger_1 = this; }
    /**
     * The options of the logger.
     */
    options;
    /**
     * The context of the logger (can be set manually or automatically inferred).
     */
    context;
    /**
     * The original context of the logger (set in the constructor).
     */
    originalContext;
    /**
     * The options used for the "inspect" method.
     */
    inspectOptions;
    /**
     * The last timestamp at which the log message was printed.
     */
    static lastTimestampAt;
    /**
     * Masks the properties set in the `redact` option.
     */
    redactor;
    constructor(contextOrOptions, options) {
        // eslint-disable-next-line prefer-const
        let [context, opts] = isString(contextOrOptions)
            ? [contextOrOptions, options]
            : options
                ? [undefined, options]
                : [contextOrOptions?.context, contextOrOptions];
        opts = opts ?? {};
        opts.colors ??= opts.colors ?? (opts.json ? false : isColorAllowed());
        opts.prefix ??= 'Nest';
        this.options = opts;
        this.inspectOptions = this.getInspectOptions();
        if (opts.redact) {
            this.redactor = Array.isArray(opts.redact)
                ? createRedactor(opts.redact)
                : createRedactor(opts.redact.paths, opts.redact.censor);
        }
        if (context) {
            this.context = context;
            this.originalContext = context;
        }
    }
    log(message, ...optionalParams) {
        if (!this.isLevelEnabled('log')) {
            return;
        }
        const { messages, context, params } = this.getContextAndMessagesToPrint([
            message,
            ...optionalParams,
        ]);
        this.printMessages(messages, context, 'log', 'stdout', undefined, params);
    }
    error(message, ...optionalParams) {
        if (!this.isLevelEnabled('error')) {
            return;
        }
        const { messages, context, stack, params } = this.getContextAndStackAndMessagesToPrint([message, ...optionalParams]);
        this.printMessages(messages, context, 'error', 'stderr', stack, params);
        this.printStackTrace(stack);
    }
    warn(message, ...optionalParams) {
        if (!this.isLevelEnabled('warn')) {
            return;
        }
        const { messages, context, params } = this.getContextAndMessagesToPrint([
            message,
            ...optionalParams,
        ]);
        this.printMessages(messages, context, 'warn', 'stdout', undefined, params);
    }
    debug(message, ...optionalParams) {
        if (!this.isLevelEnabled('debug')) {
            return;
        }
        const { messages, context, params } = this.getContextAndMessagesToPrint([
            message,
            ...optionalParams,
        ]);
        this.printMessages(messages, context, 'debug', 'stdout', undefined, params);
    }
    verbose(message, ...optionalParams) {
        if (!this.isLevelEnabled('verbose')) {
            return;
        }
        const { messages, context, params } = this.getContextAndMessagesToPrint([
            message,
            ...optionalParams,
        ]);
        this.printMessages(messages, context, 'verbose', 'stdout', undefined, params);
    }
    fatal(message, ...optionalParams) {
        if (!this.isLevelEnabled('fatal')) {
            return;
        }
        const { messages, context, stack, params } = this.getContextAndStackAndMessagesToPrint([message, ...optionalParams]);
        this.printMessages(messages, context, 'fatal', 'stderr', stack, params);
        this.printStackTrace(stack);
    }
    /**
     * Set log levels
     * @param levels log levels
     */
    setLogLevels(levels) {
        if (!this.options) {
            this.options = {};
        }
        this.options.logLevels = levels;
    }
    /**
     * Set logger context
     * @param context context
     */
    setContext(context) {
        this.context = context;
    }
    /**
     * Resets the logger context to the value that was passed in the constructor.
     */
    resetContext() {
        this.context = this.originalContext;
    }
    isLevelEnabled(level) {
        if (this.options && !this.options.logLevels) {
            this.options.logLevels = this.getDefaultLogLevels();
        }
        const logLevels = this.options?.logLevels;
        return isLogLevelEnabled(level, logLevels);
    }
    /**
     * Returns the levels used when none were passed to the constructor: the
     * `NEST_LOG_LEVEL` environment variable if it is set, every level otherwise.
     * Called on the first level check rather than in the constructor, so that
     * the default logger also sees variables loaded after "@nestjs/common" was
     * imported (for example, from a `.env` file).
     */
    getDefaultLogLevels() {
        const envLogLevels = getEnvLogLevels();
        if (envLogLevels !== false) {
            return envLogLevels ?? DEFAULT_LOG_LEVELS;
        }
        const value = process.env[LOG_LEVEL_ENV_VAR];
        if (reportedInvalidEnvLogLevel !== value) {
            reportedInvalidEnvLogLevel = value;
            // The default levels must be in place before this call, as "warn"
            // checks the level again.
            this.options.logLevels = DEFAULT_LOG_LEVELS;
            this.warn(`Invalid ${LOG_LEVEL_ENV_VAR} value "${value}". Expected a log level ("warn"), a comma-separated list ("warn,error") or a threshold (">=warn"). Every log level is enabled instead.`, 'ConsoleLogger');
        }
        return DEFAULT_LOG_LEVELS;
    }
    getTimestamp() {
        return dateTimeFormatter.format(Date.now());
    }
    printMessages(messages, context = '', logLevel = 'log', writeStreamType, errorStack, params) {
        if (this.redactor) {
            messages = messages.map(message => this.redact(this.resolveMessage(message)));
            params = params && this.redact(params);
        }
        if (this.options.json) {
            const { messages: jsonMessages, error } = this.extractJsonError(messages.map(message => this.resolveMessage(message)));
            jsonMessages.forEach((message, index) => {
                this.printAsJson(message, {
                    context,
                    logLevel,
                    writeStreamType,
                    errorStack,
                    params,
                    // The error belongs to the first record (the log message).
                    error: index === 0 ? error : undefined,
                });
            });
            return;
        }
        messages.forEach(message => {
            const pidMessage = this.formatPid(process.pid);
            const contextMessage = this.formatContext(context);
            const timestampDiff = this.updateAndGetTimestampDiff();
            const formattedLogLevel = logLevel.toUpperCase().padStart(7, ' ');
            const formattedMessage = this.formatMessage(logLevel, message, pidMessage, formattedLogLevel, contextMessage, timestampDiff, params);
            if (this.options.forceConsole) {
                if (writeStreamType === 'stderr') {
                    console.error(formattedMessage.trim());
                }
                else {
                    console.log(formattedMessage.trim());
                }
            }
            else {
                process[writeStreamType ?? 'stdout'].write(formattedMessage);
            }
        });
    }
    printAsJson(message, options) {
        const logObject = this.getJsonLogObject(message, options);
        const formattedMessage = !this.options.colors && this.inspectOptions.compact === true
            ? this.stringifyJsonLogObject(logObject)
            : inspect(logObject, this.inspectOptions);
        if (this.options.forceConsole) {
            if (options.writeStreamType === 'stderr') {
                console.error(formattedMessage);
            }
            else {
                console.log(formattedMessage);
            }
        }
        else {
            process[options.writeStreamType ?? 'stdout'].write(`${formattedMessage}\n`);
        }
    }
    getJsonLogObject(message, options) {
        const logObject = {
            level: options.logLevel,
            pid: process.pid,
            timestamp: Date.now(),
            message,
        };
        if (options.context) {
            logObject.context = options.context;
        }
        if (options.errorStack) {
            logObject.stack = options.errorStack;
        }
        if (options.error) {
            logObject.error = this.serializeError(options.error);
        }
        if (options.params) {
            if (this.options.flattenParams) {
                // Framework fields win on key collisions: a param named "message" or
                // "level" must not clobber the actual log message or severity.
                for (const [key, value] of Object.entries(options.params)) {
                    if (!(key in logObject)) {
                        logObject[key] = value;
                    }
                }
            }
            else {
                logObject.params = options.params;
            }
        }
        return logObject;
    }
    /**
     * Pulls the first `Error` out of the messages so that it can be attached to
     * the log record as a structured `error` field instead of being printed as
     * a separate record. When the error is the message itself, the record's
     * message becomes the error's message.
     */
    extractJsonError(messages) {
        const errorIndex = messages.findIndex(message => message instanceof Error);
        if (errorIndex === -1) {
            return { messages };
        }
        const error = messages[errorIndex];
        const remainingMessages = errorIndex === 0
            ? [error.message, ...messages.slice(1)]
            : messages.filter((_, index) => index !== errorIndex);
        return { messages: remainingMessages, error };
    }
    /**
     * Converts an error into a plain object: `name`, `message`, `stack`, own
     * primitive properties (e.g. `code`), and, recursively, `cause` and the
     * `errors` of an `AggregateError`, up to a fixed depth.
     */
    serializeError(error, depth = 0, ancestors = new Set()) {
        const serialized = {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
        for (const [key, value] of Object.entries(error)) {
            if (key in serialized || key === 'cause' || key === 'errors') {
                continue;
            }
            const isPrimitive = value === null ||
                (typeof value !== 'object' && typeof value !== 'function');
            if (isPrimitive) {
                serialized[key] = value;
            }
        }
        const serializeNested = (value) => {
            if (!(value instanceof Error)) {
                return value;
            }
            if (ancestors.has(value)) {
                return '[Circular]';
            }
            if (depth + 1 > MAX_ERROR_DEPTH) {
                return '[Truncated]';
            }
            return this.serializeError(value, depth + 1, ancestors);
        };
        ancestors.add(error);
        if (error.cause !== undefined) {
            serialized.cause = serializeNested(error.cause);
        }
        const errors = error.errors;
        if (Array.isArray(errors)) {
            serialized.errors = errors.map(serializeNested);
        }
        ancestors.delete(error);
        return serialized;
    }
    /**
     * Masks the properties set in the `redact` option. Returns the value itself
     * when the option isn't set or nothing matched.
     */
    redact(value) {
        return this.redactor ? this.redactor(value) : value;
    }
    formatPid(pid) {
        return `[${this.options.prefix}] ${pid}  - `;
    }
    formatContext(context) {
        if (!context) {
            return '';
        }
        context = `[${context}] `;
        return this.options.colors ? yellow(context) : context;
    }
    formatMessage(logLevel, message, pidMessage, formattedLogLevel, contextMessage, timestampDiff, params) {
        const output = this.stringifyMessage(message, logLevel);
        pidMessage = this.colorize(pidMessage, logLevel);
        formattedLogLevel = this.colorize(formattedLogLevel, logLevel);
        const paramsOutput = params ? ` ${this.stringifyParams(params)}` : '';
        return `${pidMessage}${this.getTimestamp()} ${formattedLogLevel} ${contextMessage}${output}${paramsOutput}${timestampDiff}\n`;
    }
    stringifyParams(params) {
        return inspect(params, {
            ...this.inspectOptions,
            compact: true,
            breakLength: Infinity,
        });
    }
    /**
     * Resolves a message passed as a function: a class resolves to its name,
     * any other function is called (lazy message) and its result re-resolved.
     */
    resolveMessage(message) {
        if (isFunction(message)) {
            const messageAsStr = Function.prototype.toString.call(message);
            const isClass = messageAsStr.startsWith('class ');
            if (isClass) {
                // If the message is a class, we will display the class name.
                return message.name;
            }
            // If the message is a non-class function, call it and re-resolve its value.
            return this.resolveMessage(message());
        }
        return message;
    }
    stringifyMessage(message, logLevel) {
        message = this.resolveMessage(message);
        if (typeof message === 'string') {
            return this.colorize(message, logLevel);
        }
        const outputText = inspect(message, this.inspectOptions);
        if (isPlainObject(message)) {
            return `Object(${Object.keys(message).length}) ${outputText}`;
        }
        if (Array.isArray(message)) {
            return `Array(${message.length}) ${outputText}`;
        }
        return outputText;
    }
    colorize(message, logLevel) {
        if (!this.options.colors || this.options.json) {
            return message;
        }
        const color = this.getColorByLogLevel(logLevel);
        return color(message);
    }
    printStackTrace(stack) {
        if (!stack || this.options.json) {
            return;
        }
        if (this.options.forceConsole) {
            console.error(stack);
        }
        else {
            process.stderr.write(`${stack}\n`);
        }
    }
    updateAndGetTimestampDiff() {
        const includeTimestamp = ConsoleLogger_1.lastTimestampAt && this.options?.timestamp;
        const result = includeTimestamp
            ? this.formatTimestampDiff(Date.now() - ConsoleLogger_1.lastTimestampAt)
            : '';
        ConsoleLogger_1.lastTimestampAt = Date.now();
        return result;
    }
    formatTimestampDiff(timestampDiff) {
        const formattedDiff = ` +${timestampDiff}ms`;
        return this.options.colors ? yellow(formattedDiff) : formattedDiff;
    }
    getInspectOptions() {
        let breakLength = this.options.breakLength;
        if (typeof breakLength === 'undefined') {
            breakLength = this.options.colors
                ? this.options.compact
                    ? Infinity
                    : undefined
                : this.options.compact === false
                    ? undefined
                    : Infinity; // default breakLength to Infinity if inline is not set and colors is false
        }
        const inspectOptions = {
            depth: this.options.depth ?? DEFAULT_DEPTH,
            sorted: this.options.sorted,
            showHidden: this.options.showHidden,
            compact: this.options.compact ?? (this.options.json ? true : false),
            colors: this.options.colors,
            breakLength,
        };
        if (typeof this.options.maxArrayLength !== 'undefined') {
            inspectOptions.maxArrayLength = this.options.maxArrayLength;
        }
        if (typeof this.options.maxStringLength !== 'undefined') {
            inspectOptions.maxStringLength = this.options.maxStringLength;
        }
        return inspectOptions;
    }
    /**
     * Serializes a JSON log object without ever throwing: circular references
     * are replaced with "[Circular]", and a value that cannot be serialized
     * (e.g. a throwing `toJSON()`) makes the whole record fall back to `inspect`.
     */
    stringifyJsonLogObject(logObject) {
        const replacer = this.stringifyReplacer;
        // Objects on the path from the root to the value being serialized.
        const ancestors = [];
        try {
            return JSON.stringify(logObject, function (key, value) {
                value = replacer.call(this, key, value);
                if (typeof value !== 'object' || value === null) {
                    return value;
                }
                // `this` is the object holding `key`, so everything above it on the
                // stack belongs to an already-finished sibling branch.
                while (ancestors.length > 0 &&
                    ancestors[ancestors.length - 1] !== this) {
                    ancestors.pop();
                }
                if (ancestors.includes(value)) {
                    return '[Circular]';
                }
                ancestors.push(value);
                return value;
            });
        }
        catch {
            return inspect(logObject, {
                ...this.inspectOptions,
                colors: false,
                compact: true,
                breakLength: Infinity,
            });
        }
    }
    stringifyReplacer(key, value) {
        // Mimic util.inspect behavior for JSON logger with compact on and colors off
        if (typeof value === 'bigint') {
            return value.toString();
        }
        if (typeof value === 'symbol') {
            return value.toString();
        }
        if (value instanceof Map ||
            value instanceof Set ||
            value instanceof Error) {
            return `${inspect(value, this.inspectOptions)}`;
        }
        return value;
    }
    getContextAndMessagesToPrint(args) {
        if (args?.length <= 1) {
            return { messages: args, context: this.context };
        }
        const lastElement = args[args.length - 1];
        const isContext = isString(lastElement);
        let context;
        let remainingArgs;
        if (isContext) {
            context = lastElement;
            remainingArgs = args.slice(0, args.length - 1);
        }
        else {
            context = this.context;
            remainingArgs = args;
        }
        if (this.options.structuredParams === false) {
            return { messages: remainingArgs, context };
        }
        // Extract plain objects (excluding the first arg which is always the message) as params
        const messages = [remainingArgs[0]];
        const paramObjects = [];
        for (let i = 1; i < remainingArgs.length; i++) {
            if (isPlainObject(remainingArgs[i])) {
                paramObjects.push(remainingArgs[i]);
            }
            else {
                messages.push(remainingArgs[i]);
            }
        }
        const params = paramObjects.length > 0 ? Object.assign({}, ...paramObjects) : undefined;
        return { messages, context, params };
    }
    getContextAndStackAndMessagesToPrint(args) {
        if (args.length === 2) {
            if (this.isStackFormat(args[1])) {
                return {
                    messages: [args[0]],
                    stack: args[1],
                    context: this.context,
                };
            }
            return { ...this.getContextAndMessagesToPrint(args) };
        }
        const trailingArg = args[args.length - 1];
        if (this.isStackFormat(trailingArg)) {
            const { messages, context, params } = this.getContextAndMessagesToPrint(args.slice(0, -1));
            return {
                messages,
                context,
                stack: trailingArg,
                params,
            };
        }
        const { messages, context, params } = this.getContextAndMessagesToPrint(args);
        if (messages?.length <= 1) {
            return { messages, context, params };
        }
        const lastElement = messages[messages.length - 1];
        const isStack = isString(lastElement);
        // https://github.com/nestjs/nest/issues/11074#issuecomment-1421680060
        if (!isStack && !isUndefined(lastElement)) {
            return { messages, context, params };
        }
        return {
            stack: lastElement,
            messages: messages.slice(0, messages.length - 1),
            context,
            params,
        };
    }
    isStackFormat(stack) {
        if (!isString(stack) && !isUndefined(stack)) {
            return false;
        }
        return /^(.)+\n\s+at .+:\d+:\d+/.test(stack);
    }
    getColorByLogLevel(level) {
        switch (level) {
            case 'debug':
                return clc.magentaBright;
            case 'warn':
                return clc.yellow;
            case 'error':
                return clc.red;
            case 'verbose':
                return clc.cyanBright;
            case 'fatal':
                return clc.bold;
            default:
                return clc.green;
        }
    }
};
ConsoleLogger = ConsoleLogger_1 = __decorate([
    Injectable(),
    __param(0, Optional()),
    __param(1, Optional()),
    __metadata("design:paramtypes", [Object, Object])
], ConsoleLogger);
export { ConsoleLogger };
