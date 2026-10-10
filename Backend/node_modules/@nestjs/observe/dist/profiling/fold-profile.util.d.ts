import { SpanSlice } from "./span-slice-recorder.js";
/** The shape `Profiler.stop` returns over the inspector protocol. */
export interface V8ProfileNode {
    id: number;
    callFrame: {
        functionName: string;
        url: string;
        lineNumber: number;
        columnNumber: number;
    };
    children?: number[];
}
export interface V8Profile {
    nodes: V8ProfileNode[];
    /** Microseconds, on V8's monotonic clock. */
    startTime: number;
    endTime: number;
    /** Node id per sample. */
    samples?: number[];
    /** Microseconds since the previous sample. */
    timeDeltas?: number[];
}
export interface FoldedStack {
    frames: string[];
    samples: number;
    spanId?: string;
    traceId?: string;
}
/**
 * Folds a V8 profile into per-stack sample counts, tagged with the span that
 * was executing when each sample fired.
 *
 * The tagging is a join on time: `timeDeltas` gives every sample's offset from
 * the profile's start, and `slices` says which span owned each interval. Both
 * are mapped onto `performance.now()` milliseconds, using the profile's own
 * start as the origin - V8 reports microseconds on a clock with no defined
 * epoch, so only the offsets are meaningful and the caller supplies the wall
 * time the profiler was started at.
 *
 * Samples that fall in no slice are emitted without a span. That is the honest
 * outcome for code running outside any instrumented span, and it is what lets
 * the API distinguish an exact tree from the window fallback.
 */
export declare function foldProfile(profile: V8Profile, options: {
    /** `performance.now()` reading taken when `Profiler.start` was called. */
    startedAt: number;
    slices?: SpanSlice[];
}): FoldedStack[];
