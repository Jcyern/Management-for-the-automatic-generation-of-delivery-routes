import { ConsoleLogger, type ConsoleLoggerOptions, type LogLevel } from '@nestjs/common';
/**
 * A log call recorded by `CapturingLogger`.
 *
 * @publicApi
 */
export interface CapturedLog {
    level: LogLevel;
    /**
     * The message. A lazy message (a function) is evaluated, and when an
     * `Error` is logged as the message, this is the error's message.
     */
    message: unknown;
    /**
     * The context, e.g. the one passed to `new Logger('Context')`.
     */
    context?: string;
    /**
     * The plain objects passed after the message, merged.
     */
    params?: Record<string, any>;
    /**
     * The first `Error` passed to the call, as the message or after it.
     */
    error?: Error;
    /**
     * The stack trace passed as a string, as in `logger.error(message, stack)`.
     */
    stack?: string;
    /**
     * The arguments, as passed to the logger (including the context).
     */
    args: unknown[];
}
/**
 * Criteria for `CapturingLogger` queries. Every criterion that is set must
 * match.
 *
 * @publicApi
 */
export interface CapturedLogFilter {
    level?: LogLevel;
    /**
     * A string matches the context exactly.
     */
    context?: string | RegExp;
    /**
     * A string matches when the message contains it. Only string messages
     * match (an `Error` logged as the message counts, through its message).
     */
    message?: string | RegExp;
    /**
     * Matches when each of these params is deeply equal to the logged one.
     */
    params?: Record<string, unknown>;
}
/**
 * @publicApi
 */
export type CapturedLogMatcher = CapturedLogFilter | ((entry: CapturedLog) => boolean);
/**
 * @publicApi
 */
export interface CapturingLoggerOptions extends ConsoleLoggerOptions {
    /**
     * If enabled, logs are also printed, as a `ConsoleLogger` with the same
     * options would print them.
     * @default false
     */
    print?: boolean;
}
/**
 * A logger for tests that records every log call with its structured data,
 * so that tests can assert on it. Pass it to `setLogger()` of the testing
 * module builder, or to `app.useLogger()`, to capture the framework's logs and
 * the logs of `Logger` instances.
 *
 * Every level is captured unless `logLevels` is set; the `NEST_LOG_LEVEL`
 * environment variable is ignored.
 *
 * @example
 * const logger = new CapturingLogger();
 * const moduleRef = await Test.createTestingModule({ providers: [PaymentsService] })
 *   .setLogger(logger)
 *   .compile();
 *
 * await moduleRef.get(PaymentsService).charge(order);
 *
 * logger.assertLogged({ level: 'warn', context: 'PaymentsService', message: /retrying/ });
 *
 * @publicApi
 */
export declare class CapturingLogger extends ConsoleLogger {
    private readonly captured;
    private readonly shouldPrint;
    constructor(options?: CapturingLoggerOptions);
    /**
     * The recorded entries, oldest first.
     */
    get entries(): CapturedLog[];
    log(message: any, ...optionalParams: any[]): void;
    error(message: any, ...optionalParams: any[]): void;
    warn(message: any, ...optionalParams: any[]): void;
    debug(message: any, ...optionalParams: any[]): void;
    verbose(message: any, ...optionalParams: any[]): void;
    fatal(message: any, ...optionalParams: any[]): void;
    /**
     * Returns the entries that match.
     */
    filter(matcher?: CapturedLogMatcher): CapturedLog[];
    /**
     * Returns the first entry that matches.
     */
    find(matcher: CapturedLogMatcher): CapturedLog | undefined;
    /**
     * Throws an error listing the captured entries if no entry matches.
     * @returns The first entry that matches.
     */
    assertLogged(matcher: CapturedLogMatcher): CapturedLog;
    /**
     * Throws an error listing the matching entries if any entry matches.
     */
    assertNotLogged(matcher: CapturedLogMatcher): void;
    /**
     * Removes the recorded entries.
     */
    clear(): void;
    private capture;
}
