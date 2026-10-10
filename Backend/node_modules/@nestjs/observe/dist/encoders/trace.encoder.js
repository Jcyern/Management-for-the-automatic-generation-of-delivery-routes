import { remapKeys } from "./remap-keys.util.js";
export const TRACE_KEY_MAP = {
    name: "n",
    origin: "o",
    tags: "t",
    duration: "d",
    error: "e",
    className: "c",
    methodKey: "m",
    children: "ch",
    spanId: "s",
    startOffset: "so",
};
/**
 * Encodes one span and everything below it.
 *
 * Shared by the request and job encoders rather than duplicated in each: both
 * kinds of operation produce the same span shape, so a reader sees one format
 * whichever produced it, and `encoders.spec.ts` asserts exactly that.
 */
export function encodeTrace(trace) {
    const encoded = remapKeys(trace, TRACE_KEY_MAP);
    // Outside the key remapping above, deliberately. Done inside that loop, every
    // own key of a node re-encoded that node's whole subtree, so the work was
    // keys^depth rather than one visit per node - a trace a few levels deeper
    // than a plain HTTP request (a queued job that authenticates, submits and
    // polls) pinned the event loop and never came back.
    if (trace.children && trace.children.length > 0) {
        encoded.ch = trace.children.map((child) => encodeTrace(child));
    }
    return encoded;
}
