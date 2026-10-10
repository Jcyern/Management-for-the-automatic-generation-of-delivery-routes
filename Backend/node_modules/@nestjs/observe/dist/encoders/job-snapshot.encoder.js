import { remapKeys } from "./remap-keys.util.js";
import { encodeTrace } from "./trace.encoder.js";
const SNAPSHOT_KEY_MAP = {
    id: "i",
    traceId: "ti",
    name: "n",
    queueName: "q",
    status: "s",
    calledAt: "c",
    startTimestamp: "st",
    duration: "d",
    enqueuedAt: "ea",
    waitDuration: "wd",
    attemptsMade: "am",
    maxAttempts: "ma",
    tags: "tg",
    traces: "t",
    error: "e",
};
export class JobSnapshotEncoder {
    static encode(snapshot) {
        const encoded = remapKeys(snapshot, SNAPSHOT_KEY_MAP);
        if (snapshot.traces) {
            encoded.t = snapshot.traces.map((trace) => encodeTrace(trace));
        }
        return encoded;
    }
}
