import { CustomMetric } from "../interfaces/custom-metric.interface.js";
declare const DEFAULT_LABEL: "default";
/**
 * Serialises a label object into the map key that identifies its series.
 *
 * Keys are sorted first: `JSON.stringify` preserves insertion order, so
 * `{ route, method }` and `{ method, route }` would otherwise be two different
 * series for what is the same label set.
 */
export declare function stringifyLabel(label: Record<string, string | number>): string;
/**
 * Distinct label combinations one metric may hold.
 *
 * Counters and gauges are cumulative: a series, once created, is kept and
 * flushed for the life of the process. That is correct for a counter and fatal
 * for one labelled with something unbounded - a user id, a request id, a raw
 * URL - which grows this object forever inside the *host application's* memory
 * and adds a row per series to every flush. Summaries need no such cap; their
 * windows are cleared on each flush.
 *
 * A thousand is far above a sensible label set and far below a leak.
 */
export declare const MAX_SERIES_PER_METRIC = 1000;
/**
 * Whether a metric may record under `key`.
 *
 * Refuses rather than throws. This runs inside a customer's own code path -
 * `counter.increment({ userId })` in the middle of their request handler - and
 * an agent that crashes the application it is measuring is worse than one that
 * drops a series. The first refusal is logged, once per metric, because a
 * silent cap is indistinguishable from a metric that does not work.
 */
export declare function admitsSeries(metricName: string, values: Record<string, unknown>, key: string, state: {
    warned: boolean;
}): boolean;
export declare class Counter<TLabel extends string = typeof DEFAULT_LABEL> implements CustomMetric<TLabel> {
    /**
     * Whether the series cap has already been reported. An object rather than a
     * bare field so `admitsSeries` can set it - a `private` member is not
     * assignable to the structural type such a helper can name.
     */
    private readonly seriesLimit;
    /**
     * The name of the counter.
     * This should be a descriptive name that identifies the counter.
     * For example, "user_login_count" or "api_request_count".
     */
    readonly name: string;
    /**
     * The type of the custom metric.
     * This is always 'counter' for this class.
     * It indicates that this metric is a counter that can be incremented.
     */
    readonly type: "counter";
    /**
     * A brief description of the counter's purpose.
     * This can be used to provide additional context about what the counter represents.
     * For example, "Number of user logins in the last hour" or "Total API requests received".
     */
    readonly description?: string;
    /**
     * The value of the counter.
     */
    readonly value: Record<string, number>;
    /**
     * Optional labels for the counter.
     * Labels are key-value pairs that can be used to add additional context to the counter.
     * For example, you might use labels to indicate the environment (e.g., "production", "development") or the service (e.g., "user-service", "order-service").
     */
    readonly labels?: TLabel[];
    private _tags?;
    private _onChange?;
    private _initialValue;
    private _lastUpdated;
    private _lastFlushedValue;
    /**
     * How much each label rose since the last successful flush.
     *
     * Reported alongside the cumulative `value` so the backend has an additive
     * quantity to aggregate. Summing cumulative readings double counts, and a
     * process restart resets `value` to zero, which makes a naive
     * difference-on-read undercount - this is measured in-process, so neither
     * problem applies.
     */
    get increase(): Record<string, number>;
    /**
     * Marks the current cumulative values as reported.
     *
     * Called by the agent only once a flush has actually been written, so a failed
     * flush leaves the baseline untouched and the increase rolls into the next one
     * instead of being lost.
     */
    markFlushed(): void;
    /**
     * Gets the timestamp of when the counter was last updated.
     * This is a Unix timestamp in milliseconds.
     * @returns The last updated timestamp.
     */
    get lastUpdated(): number;
    /**
     * Gets tags associated with the counter.
     * Tags are key-value pairs that provide additional context about the counter.
     * @returns An object containing tags, or undefined if no tags are set.
     */
    get tags(): Record<string, string> | undefined;
    /**
     * Sets tags for the counter.
     * Tags are key-value pairs that provide additional context about the counter.
     * @param tags An object containing tags to set.
     */
    set tags(tags: Record<string, string> | undefined);
    constructor(name: string);
    constructor(name: string, description: string);
    constructor(name: string, description: string, initialValue: number);
    constructor(name: string, description: string, labels: TLabel[]);
    constructor(name: string, description: string, initialValue: number, labels: TLabel[]);
    /**
     * The form `TracerService.counter()` builds when it spreads an attributes
     * bag, where any member may be absent. Listed last so the overloads above
     * stay the ones a hand-written call resolves to.
     */
    constructor(name: string, description?: string, initialValue?: number, labels?: TLabel[]);
    /**
     * Gets the current value of the counter.
     * If labels are defined, you must specify a label to get the value for that label.
     * If no label is specified, it returns the value for the default label.
     * @returns The current value of the counter.
     */
    getValue(): number;
    /**
     * Gets the current value of the counter.
     * If labels are defined, you must specify a label to get the value for that label.
     * If no label is specified, it returns the value for the default label.
     * @param label Optional label to get the value for. If not provided, returns the default value.
     * @returns The current value of the counter.
     */
    getValue(label: Record<TLabel, string | number>): number;
    /**
     * Increments the counter by a specified value.
     * If no value is provided, it defaults to 1.
     */
    increment(): void;
    /**
     * Increments the counter by a specified value for a specific label.
     * If no value is provided, it defaults to 1.
     * @param label The label to increment the counter for.
     */
    increment(label: Record<TLabel, string | number>): void;
    /**
     * Increments the counter by a specified value.
     * @param value Value to increment the counter by.
     */
    increment(value: number): void;
    /**
     * Increments the counter by a specified value for a specific label.
     * If no value is provided, it defaults to 1.
     * @param label The label to increment the counter for.
     * @param value Value to increment the counter by.
     */
    increment(label: Record<TLabel, string | number>, value: number): void;
    private validateLabels;
}
export {};
