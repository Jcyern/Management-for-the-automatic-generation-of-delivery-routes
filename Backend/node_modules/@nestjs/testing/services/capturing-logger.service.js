import { ConsoleLogger, LOG_LEVELS, } from '@nestjs/common';
import { inspect, isDeepStrictEqual } from 'util';
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
export class CapturingLogger extends ConsoleLogger {
    captured = [];
    shouldPrint;
    constructor(options = {}) {
        const { print = false, ...consoleLoggerOptions } = options;
        super({
            ...consoleLoggerOptions,
            logLevels: consoleLoggerOptions.logLevels ?? [...LOG_LEVELS],
        });
        this.shouldPrint = print;
    }
    /**
     * The recorded entries, oldest first.
     */
    get entries() {
        return [...this.captured];
    }
    log(message, ...optionalParams) {
        this.capture('log', [message, ...optionalParams]);
    }
    error(message, ...optionalParams) {
        this.capture('error', [message, ...optionalParams]);
    }
    warn(message, ...optionalParams) {
        this.capture('warn', [message, ...optionalParams]);
    }
    debug(message, ...optionalParams) {
        this.capture('debug', [message, ...optionalParams]);
    }
    verbose(message, ...optionalParams) {
        this.capture('verbose', [message, ...optionalParams]);
    }
    fatal(message, ...optionalParams) {
        this.capture('fatal', [message, ...optionalParams]);
    }
    /**
     * Returns the entries that match.
     */
    filter(matcher = {}) {
        const predicate = toPredicate(matcher);
        return this.captured.filter(entry => predicate(entry));
    }
    /**
     * Returns the first entry that matches.
     */
    find(matcher) {
        return this.captured.find(toPredicate(matcher));
    }
    /**
     * Throws an error listing the captured entries if no entry matches.
     * @returns The first entry that matches.
     */
    assertLogged(matcher) {
        const entry = this.find(matcher);
        if (!entry) {
            throw new Error(`Expected a log entry matching ${describeMatcher(matcher)}, but none of the ${this.captured.length} captured entries matched.${formatEntries(this.captured)}`);
        }
        return entry;
    }
    /**
     * Throws an error listing the matching entries if any entry matches.
     */
    assertNotLogged(matcher) {
        const entries = this.filter(matcher);
        if (entries.length > 0) {
            throw new Error(`Expected no log entry matching ${describeMatcher(matcher)}, but ${entries.length} matched.${formatEntries(entries)}`);
        }
    }
    /**
     * Removes the recorded entries.
     */
    clear() {
        this.captured.length = 0;
    }
    capture(level, args) {
        if (!this.isLevelEnabled(level)) {
            return;
        }
        const parsed = level === 'error' || level === 'fatal'
            ? this.getContextAndStackAndMessagesToPrint(args)
            : this.getContextAndMessagesToPrint(args);
        // Evaluated once, for the entry and for printing.
        const resolvedMessages = parsed.messages.map(message => this.resolveMessage(message));
        const { messages, error } = this.extractJsonError(resolvedMessages);
        const params = 'params' in parsed ? parsed.params : undefined;
        const stack = 'stack' in parsed && typeof parsed.stack === 'string'
            ? parsed.stack
            : undefined;
        const entry = { level, message: messages[0], args };
        if (parsed.context) {
            entry.context = parsed.context;
        }
        if (params) {
            entry.params = params;
        }
        if (error) {
            entry.error = error;
        }
        if (stack) {
            entry.stack = stack;
        }
        this.captured.push(entry);
        if (this.shouldPrint) {
            // What the ConsoleLogger method for this level does once the arguments
            // are parsed.
            const isError = level === 'error' || level === 'fatal';
            this.printMessages(resolvedMessages, parsed.context, level, isError ? 'stderr' : 'stdout', stack, params);
            if (isError) {
                this.printStackTrace(stack);
            }
        }
    }
}
function toPredicate(matcher) {
    if (typeof matcher === 'function') {
        return matcher;
    }
    const { level, context, message, params } = matcher;
    return entry => (level === undefined || entry.level === level) &&
        (context === undefined ||
            (typeof context === 'string'
                ? entry.context === context
                : entry.context !== undefined &&
                    entry.context.search(context) !== -1)) &&
        (message === undefined ||
            (typeof entry.message === 'string' &&
                (typeof message === 'string'
                    ? entry.message.includes(message)
                    : entry.message.search(message) !== -1))) &&
        (params === undefined ||
            Object.entries(params).every(([key, value]) => isDeepStrictEqual(entry.params?.[key], value)));
}
function describeMatcher(matcher) {
    return typeof matcher === 'function'
        ? 'the predicate'
        : inspect(matcher, { breakLength: Infinity });
}
const MAX_LISTED_ENTRIES = 50;
function formatEntries(entries) {
    if (entries.length === 0) {
        return '';
    }
    const lines = entries.slice(-MAX_LISTED_ENTRIES).map(entry => {
        const context = entry.context ? ` [${entry.context}]` : '';
        const message = typeof entry.message === 'string'
            ? entry.message
            : inspect(entry.message, { breakLength: Infinity, depth: 2 });
        const params = entry.params
            ? ` ${inspect(entry.params, { breakLength: Infinity, depth: 2 })}`
            : '';
        return `  ${entry.level.toUpperCase()}${context} ${message}${params}`;
    });
    const omitted = entries.length - lines.length;
    const header = omitted > 0 ? `\n  (${omitted} earlier entries omitted)` : '';
    return `\nCaptured entries:${header}\n${lines.join('\n')}`;
}
