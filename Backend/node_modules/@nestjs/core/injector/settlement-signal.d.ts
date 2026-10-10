/**
 * A dependency of the host of a signal, as recorded by `insertRef`.
 */
interface SettlementSignalRef {
    id: string;
    settlementSignal?: SettlementSignal;
}
/**
 * SettlementSignal is used to signal the resolution of a provider/instance.
 * Calling `complete` or `error` will resolve the promise returned by `asPromise`.
 * Can be used to detect circular dependencies.
 */
export declare class SettlementSignal {
    private readonly _refs;
    private readonly settledPromise;
    private settleFn;
    private completed;
    constructor();
    /**
     * Resolves the promise returned by `asPromise`.
     */
    complete(): void;
    /**
     * Rejects the promise returned by `asPromise` with the given error.
     * @param err Error to reject the promise returned by `asPromise` with.
     */
    error(err: unknown): void;
    /**
     * Returns a promise that will be resolved when `complete` or `error` is called.
     * @returns Promise that will be resolved when `complete` or `error` is called.
     */
    asPromise(): Promise<unknown>;
    /**
     * Inserts a wrapper that the host of this signal depends on.
     * @param ref Wrapper to insert.
     */
    insertRef(ref: SettlementSignalRef): void;
    /**
     * Check if relationship is circular, i.e. whether the host of this signal
     * is still waiting, directly or through other pending dependencies, on the
     * given wrapper.
     * @param wrapperId Wrapper id to check.
     * @returns True if relationship is circular, false otherwise.
     */
    isCycle(wrapperId: string): boolean;
    private waitsOn;
}
export {};
