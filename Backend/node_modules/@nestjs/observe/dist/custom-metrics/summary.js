const DEFAULT_LABEL = "default";
/**
 * How many observations per label are kept to compute quantiles from.
 *
 * A summary must not grow with throughput, so observations past this are
 * reservoir-sampled rather than appended. The count, sum and maximum are tracked
 * separately and stay exact however many observations arrive.
 */
const DEFAULT_SAMPLE_SIZE = 2048;
/**
 * A distribution of observations - request latency being the usual case.
 *
 * Quantiles are computed here, in-process, over the observations seen since the
 * last flush; the backend only ever receives finished numbers. That keeps the
 * payload flat and small, at the cost of quantiles that cannot be merged exactly
 * across instances - the backend averages them, which estimates rather than
 * derives the true percentile. `observations`, `total` and `maximum` carry no
 * such caveat: they merge exactly, so a mean and a worst case built from them
 * stay truthful across any number of reporters.
 */
export class Summary {
    /**
     * The name of the summary.
     * This should be a descriptive name that identifies the distribution.
     * For example, "http_request_duration_ms" or "db_query_duration_ms".
     */
    name;
    /**
     * The type of the custom metric.
     * This is always 'summary' for this class.
     */
    type;
    /**
     * A brief description of the summary's purpose.
     * For example, "Request latency in milliseconds".
     */
    description;
    /**
     * Optional labels for the summary.
     * Each label accumulates its own independent distribution.
     */
    labels;
    _tags;
    _onChange;
    _lastUpdated = Date.now();
    _sampleSize;
    /**
     * Exact per-label aggregates for the current window. Tracked apart from the
     * sample below so they describe every observation, not just the retained ones.
     */
    _count = {};
    _sum = {};
    _max = {};
    /**
     * Bounded per-label sample the quantiles are read off.
     */
    _samples = {};
    /**
     * The medians, doubling as the metric's headline reading.
     *
     * A distribution has no single value, so this is what stands in wherever one
     * number is needed. It is a getter, which means `for...in` cannot see it and
     * the encoder leaves it off the wire - the backend derives the same figure
     * from the reported median instead of carrying it twice.
     */
    get value() {
        return this.quantile(0.5);
    }
    /**
     * Median per label over the observations since the last flush.
     */
    get p50() {
        return this.quantile(0.5);
    }
    /**
     * 95th percentile per label over the observations since the last flush.
     */
    get p95() {
        return this.quantile(0.95);
    }
    /**
     * 99th percentile per label over the observations since the last flush.
     */
    get p99() {
        return this.quantile(0.99);
    }
    /**
     * How many observations each label saw since the last flush. Exact - this
     * counts every observation, including those the sample dropped.
     */
    get observations() {
        return { ...this._count };
    }
    /**
     * Sum of every observation per label since the last flush. Exact. Paired with
     * `observations` it gives the backend a true mean across all reporters, which
     * the quantiles cannot provide.
     */
    get total() {
        return { ...this._sum };
    }
    /**
     * Largest single observation per label since the last flush. Exact, and it
     * merges exactly, so the worst case survives being combined across instances.
     */
    get maximum() {
        return { ...this._max };
    }
    /**
     * Gets the timestamp of when the summary was last updated.
     * This is a Unix timestamp in milliseconds.
     */
    get lastUpdated() {
        return this._lastUpdated;
    }
    /**
     * Gets tags associated with the summary.
     */
    get tags() {
        return this._tags;
    }
    /**
     * Sets tags for the summary.
     */
    set tags(tags) {
        if (tags && typeof tags !== "object") {
            throw new Error("Tags must be an object with key-value pairs.");
        }
        this._tags = tags;
    }
    constructor(name, attributes) {
        this.name = name;
        this.description = attributes?.description;
        this.labels = attributes?.labels;
        this.type = "summary";
        this._sampleSize = attributes?.sampleSize ?? DEFAULT_SAMPLE_SIZE;
    }
    observe(value, label) {
        if (typeof value !== "number" || !Number.isFinite(value)) {
            throw new Error(`Cannot observe a non-finite value on summary "${this.name}".`);
        }
        if (this.labels && !label) {
            throw new Error(`Cannot observe on a summary with labels without specifying one. For example, use \`summary.observe(12, "${this.labels[0]}")\`.`);
        }
        if (label && this.labels && !this.labels.includes(label)) {
            throw new Error(`Label "${label}" is not defined in the summary. Available labels: ${this.labels.join(", ")}.`);
        }
        const key = label ?? DEFAULT_LABEL;
        const count = (this._count[key] ?? 0) + 1;
        this._count[key] = count;
        this._sum[key] = (this._sum[key] ?? 0) + value;
        this._max[key] = Math.max(this._max[key] ?? value, value);
        this.sample(key, value, count);
        this._lastUpdated = Date.now();
        if (this._onChange) {
            this._onChange(this);
        }
    }
    /**
     * Starts a fresh window.
     *
     * Called by the agent only once a flush has actually been written, so a failed
     * flush leaves the window intact and its observations roll into the next one
     * rather than being thrown away.
     */
    markFlushed() {
        this._count = {};
        this._sum = {};
        this._max = {};
        this._samples = {};
    }
    /**
     * Keeps the retained sample uniform over the whole window (Algorithm R).
     *
     * Once the reservoir is full each further observation replaces a random slot
     * with probability sampleSize/count, which leaves every observation equally
     * likely to be present - so quantiles read off the sample stay representative
     * however far throughput outruns the reservoir.
     */
    sample(key, value, count) {
        const samples = (this._samples[key] ??= []);
        if (samples.length < this._sampleSize) {
            samples.push(value);
            return;
        }
        const slot = Math.floor(Math.random() * count);
        if (slot < this._sampleSize) {
            samples[slot] = value;
        }
    }
    /**
     * Nearest-rank quantile per label, read off a sorted copy of the sample.
     */
    quantile(percentile) {
        const quantiles = {};
        for (const [key, samples] of Object.entries(this._samples)) {
            if (!samples.length) {
                continue;
            }
            const sorted = [...samples].sort((a, b) => a - b);
            const rank = Math.ceil(percentile * sorted.length) - 1;
            quantiles[key] = sorted[Math.min(Math.max(rank, 0), sorted.length - 1)];
        }
        return quantiles;
    }
}
