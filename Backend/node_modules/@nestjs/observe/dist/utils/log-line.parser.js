/**
 * Turns a line of stdout into a structured log entry.
 *
 * Two shapes arrive here and neither can be assumed: a service running Nest's
 * JSON logger emits one object per line, while the default logger emits
 * formatted text - and plenty of lines are neither, because anything that writes
 * to stdout ends up in this path. Detection is therefore per line rather than
 * per service: a line that parses as a recognisable JSON log is treated as
 * structured, everything else falls back to text parsing, and a line that
 * matches nothing is still forwarded with its full text as the message.
 *
 * Nothing is ever dropped for being unparseable. A log the agent does not
 * understand is still the log the user is looking for.
 */
/**
 * CSI escape sequences - colour codes and cursor moves. Narrower than a
 * general-purpose ANSI stripper on purpose: this only has to undo what console
 * loggers emit, and a tight pattern cannot eat real log content.
 */
// eslint-disable-next-line no-control-regex
const ANSI_PATTERN = /\x1B\[[0-9;]*[A-Za-z]/g;
/**
 * Nest's default ConsoleLogger line:
 *   [Nest] 1234  - 07/29/2026, 10:42:18 AM     LOG [AppController] message
 * The context bracket is optional - `logger.log()` without a context omits it.
 */
const NEST_TEXT_PATTERN = /^\[Nest\]\s+\d+\s+-\s+.+?\s{2,}(FATAL|ERROR|WARN|LOG|DEBUG|VERBOSE)\s+(?:\[([^\]]+)\]\s*)?([\s\S]*)$/;
/**
 * Suffix appended by LoggerPatcherService when a trace is in scope. Parsing it
 * back off recovers the trace id even for lines whose async context is gone by
 * the time the forwarder sees them.
 */
const TRACE_ID_SUFFIX_PATTERN = /\s*Trace ID:\s*(\S+)\s*$/;
/**
 * Keys the JSON logger sets that map onto modelled columns; anything else a
 * service attaches is preserved under `attributes`.
 */
const STRUCTURED_KEYS = new Set([
    "level",
    "message",
    "context",
    "traceId",
    "timestamp",
    "pid",
]);
export function stripAnsi(value) {
    return value.replace(ANSI_PATTERN, "");
}
export function parseLogLine(line) {
    const clean = stripAnsi(line).trimEnd();
    return parseStructured(clean) ?? parseNestText(clean) ?? { message: clean };
}
function parseStructured(line) {
    // Cheap guard so the common text case never pays for a thrown parse error.
    if (!line.startsWith("{")) {
        return null;
    }
    let parsed;
    try {
        parsed = JSON.parse(line);
    }
    catch {
        return null;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return null;
    }
    const record = parsed;
    // A JSON line with no message is some other program's output that happens to
    // be JSON - not a log we can model, so let the text path have it.
    if (typeof record.message !== "string") {
        return null;
    }
    const attributes = Object.fromEntries(Object.entries(record).filter(([key]) => !STRUCTURED_KEYS.has(key)));
    return {
        level: typeof record.level === "string" ? record.level : undefined,
        context: typeof record.context === "string" ? record.context : undefined,
        traceId: typeof record.traceId === "string" ? record.traceId : undefined,
        message: record.message,
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
    };
}
function parseNestText(line) {
    const match = NEST_TEXT_PATTERN.exec(line);
    if (!match) {
        return null;
    }
    const [, level, context, rest] = match;
    const traceIdMatch = TRACE_ID_SUFFIX_PATTERN.exec(rest);
    return {
        level: level.toLowerCase(),
        context: context || undefined,
        traceId: traceIdMatch?.[1],
        message: traceIdMatch ? rest.slice(0, traceIdMatch.index).trimEnd() : rest,
    };
}
