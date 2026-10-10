/**
 * A stretch of time during which one span's code was the innermost
 * instrumented thing running on this thread.
 *
 * Times are `performance.now()` milliseconds - the same clock profile samples
 * are mapped onto.
 */
export interface SpanSlice {
    spanId: string;
    traceId: string;
    from: number;
    to: number;
}
/**
 * Records which span was executing when, so profile samples can be labelled
 * after the fact.
 *
 * This exists because a JS-only profiler cannot label a sample at the moment it
 * fires. V8 samples on its own thread and hands back a batch afterwards; there
 * is no JS callback to read `AsyncLocalStorage` from. Datadog's profiler solves
 * this with a native addon that writes a thread-local at sample time. Without
 * one, the equivalent is to record the timeline in JS and join it to the
 * samples' timestamps once the batch arrives.
 *
 * The join is only sound because Node runs JS on one thread: at any instant
 * exactly one span's synchronous code is on the stack, so a sample's timestamp
 * identifies it unambiguously. That is a different claim from the time-window
 * overlap the API's honesty rule rejects - overlapping *span durations* say
 * nothing on a concurrent server, because a span's duration includes the awaits
 * during which other requests ran. These are execution slices, not durations.
 *
 * Known limitation, and the reason unattributed samples stay unlabelled rather
 * than being guessed at: while a span awaits, uninstrumented code may run. No
 * slice covers it, so its samples carry no span - which is correct, since that
 * code is in no span - but a sample landing in an outer span's slice while an
 * uninstrumented callback runs is attributed to the outer span. Instrumented
 * work always opens its own slice and is attributed exactly.
 */
export declare class SpanSliceRecorder {
    private readonly slices;
    /** Innermost-first stack of spans currently open on this thread. */
    private readonly stack;
    /**
     * Records that a span began executing.
     *
     * Closes the enclosing span's slice first: from here until this span ends,
     * the innermost thing running is this one, and attributing the interval to
     * both would double-count it.
     */
    enter(traceId: string, spanId: string, at?: number): void;
    /**
     * Records that a span stopped executing, and resumes the enclosing one.
     *
     * Accepts an absent id because a step whose caller could not be resolved was
     * never entered either: the lookup below simply misses and nothing unwinds.
     */
    exit(spanId: string | undefined, at?: number): void;
    /**
     * Every slice recorded so far, oldest first, with the still-open spans
     * closed at `until` so a window flush does not lose the work in flight.
     */
    drain(until?: number): SpanSlice[];
    /** Discards everything, for shutdown and for tests. */
    reset(): void;
    private closeTop;
    private push;
}
export declare function activeSliceRecorder(): SpanSliceRecorder | null;
export declare function setActiveSliceRecorder(recorder: SpanSliceRecorder | null): void;
