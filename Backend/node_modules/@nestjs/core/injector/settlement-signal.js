/**
 * SettlementSignal is used to signal the resolution of a provider/instance.
 * Calling `complete` or `error` will resolve the promise returned by `asPromise`.
 * Can be used to detect circular dependencies.
 */
export class SettlementSignal {
    _refs = new Map();
    settledPromise;
    settleFn;
    completed = false;
    constructor() {
        this.settledPromise = new Promise(resolve => {
            this.settleFn = resolve;
        });
    }
    /**
     * Resolves the promise returned by `asPromise`.
     */
    complete() {
        this.completed = true;
        this.settleFn();
    }
    /**
     * Rejects the promise returned by `asPromise` with the given error.
     * @param err Error to reject the promise returned by `asPromise` with.
     */
    error(err) {
        this.completed = true;
        this.settleFn(err);
    }
    /**
     * Returns a promise that will be resolved when `complete` or `error` is called.
     * @returns Promise that will be resolved when `complete` or `error` is called.
     */
    asPromise() {
        return this.settledPromise;
    }
    /**
     * Inserts a wrapper that the host of this signal depends on.
     * @param ref Wrapper to insert.
     */
    insertRef(ref) {
        this._refs.set(ref.id, ref);
    }
    /**
     * Check if relationship is circular, i.e. whether the host of this signal
     * is still waiting, directly or through other pending dependencies, on the
     * given wrapper.
     * @param wrapperId Wrapper id to check.
     * @returns True if relationship is circular, false otherwise.
     */
    isCycle(wrapperId) {
        return this.waitsOn(wrapperId, new Set());
    }
    waitsOn(wrapperId, visited) {
        if (this.completed || visited.has(this)) {
            return false;
        }
        visited.add(this);
        for (const [refId, ref] of this._refs) {
            if (refId === wrapperId ||
                ref.settlementSignal?.waitsOn(wrapperId, visited)) {
                return true;
            }
        }
        return false;
    }
}
