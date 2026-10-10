import { CompleteTraceEventNode, OngoingTraceEventNode } from "./trace-events.interfaces.js";
export interface JobSnapshot {
    /**
     * Unique identifier for the job.
     * This is typically a UUID or a similar unique identifier.
     */
    id: string;
    /**
     * Unique identifier for the trace associated
     */
    traceId: string;
    /**
     * Name of the job.
     * This is a human-readable name that describes the job.
     */
    name: string;
    /**
     * Name of the queue to which the job belongs.
     * This is useful for categorizing jobs and understanding their context.
     */
    queueName: string;
    /**
     * The status of the job.
     */
    status?: "completed" | "failed";
    /**
     * Represents when the request was executed.
     * This is a human-readable timestamp, typically in ISO 8601 format.
     */
    calledAt?: string;
    /**
     * Timestamp when the request started.
     * This is a high-resolution timestamp, typically in milliseconds.
     */
    startTimestamp?: number;
    /**
     * The duration of the job in milliseconds.
     *
     * This is processing time only - it starts when the worker picks the job up,
     * so it says nothing about how long the job sat in the queue first. See
     * `waitDuration` for that.
     */
    duration?: number;
    /**
     * When the job was added to the queue, ISO 8601.
     */
    enqueuedAt?: string;
    /**
     * Milliseconds the job spent waiting in the queue before a worker started it,
     * measured from the moment it became runnable rather than from when it was
     * created - any `delay` the caller asked for is excluded.
     *
     * This is the number that reveals a backlog: a job that waited four minutes
     * and then ran in 10ms is indistinguishable from a healthy one on `duration`
     * alone.
     */
    waitDuration?: number;
    /**
     * How many attempts had already been made when this run started - 0 on the
     * first attempt. A job that only succeeded on its fifth try is otherwise
     * indistinguishable from one that succeeded immediately.
     */
    attemptsMade?: number;
    /**
     * Maximum attempts configured for the job, so a consumer can tell "retried
     * once of three" from "final attempt failed".
     */
    maxAttempts?: number;
    /**
     * Array of trace events associated with the job.
     * This array contains both ongoing and complete trace events.
     * Ongoing events are those that have started but not yet ended.
     */
    traces: Array<OngoingTraceEventNode | CompleteTraceEventNode>;
    /**
     * Tags associated with the jobs.
     * Tags are key-value pairs that provide additional context about the jobs.
     * This field is optional and can be used to capture additional metadata about the job.
     * @example { 'environment': 'production', 'version': '1.0.0' }
     * @default {}
     */
    tags?: Record<string, string | number | boolean>;
    /**
     * Indicates whether an error occurred during the operation represented by the trace span.
     * If undefined, it means no error occurred.
     */
    error?: {
        cls?: string;
        message: string;
        stack?: string;
        tags?: Record<string, string | number | boolean>;
    };
}
