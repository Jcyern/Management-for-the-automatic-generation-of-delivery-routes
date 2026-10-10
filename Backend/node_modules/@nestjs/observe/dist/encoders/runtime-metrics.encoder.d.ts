import { NodeRuntimeMetrics } from "../interfaces/index.js";
declare const RUNTIME_METRICS_KEY_MAP: {
    readonly cpu: "c";
    readonly memory: "m";
    readonly gc: "g";
    readonly eventLoop: "e";
};
declare const CPU_KEY_MAP: {
    readonly user: "u";
    readonly system: "s";
    readonly percentageUsed: "p";
};
declare const MEMORY_KEY_MAP: {
    readonly rss: "r";
    readonly heapTotal: "ht";
    readonly heapUsed: "hu";
    readonly external: "e";
    readonly arrayBuffers: "ab";
    readonly percentageUsed: "p";
};
declare const GC_KEY_MAP: {
    readonly count: "c";
    readonly totalDuration: "td";
    readonly breakdown: "b";
};
declare const GC_BREAKDOWN_KEY_MAP: {
    readonly minor: "m";
    readonly major: "j";
    readonly incremental: "i";
};
declare const EVENT_LOOP_KEY_MAP: {
    readonly lag: "l";
    readonly utilization: "u";
};
type EncodedCpu = {
    [K in keyof NodeRuntimeMetrics["cpu"] as K extends keyof typeof CPU_KEY_MAP ? (typeof CPU_KEY_MAP)[K] : never]: NodeRuntimeMetrics["cpu"][K];
};
type EncodedMemory = {
    [K in keyof NodeRuntimeMetrics["memory"] as K extends keyof typeof MEMORY_KEY_MAP ? (typeof MEMORY_KEY_MAP)[K] : never]: NodeRuntimeMetrics["memory"][K];
};
type EncodedGcBreakdown = {
    [K in keyof NonNullable<NodeRuntimeMetrics["gc"]["breakdown"]> as K extends keyof typeof GC_BREAKDOWN_KEY_MAP ? (typeof GC_BREAKDOWN_KEY_MAP)[K] : never]: NonNullable<NodeRuntimeMetrics["gc"]["breakdown"]>[K];
};
type EncodedGc = Omit<{
    [K in keyof NodeRuntimeMetrics["gc"] as K extends keyof typeof GC_KEY_MAP ? (typeof GC_KEY_MAP)[K] : never]: NodeRuntimeMetrics["gc"][K];
}, "b"> & {
    b?: EncodedGcBreakdown;
};
type EncodedEventLoop = {
    [K in keyof NodeRuntimeMetrics["eventLoop"] as K extends keyof typeof EVENT_LOOP_KEY_MAP ? (typeof EVENT_LOOP_KEY_MAP)[K] : never]: NodeRuntimeMetrics["eventLoop"][K];
};
export type EncodedNodeRuntimeMetrics = Omit<{
    [K in keyof NodeRuntimeMetrics as K extends keyof typeof RUNTIME_METRICS_KEY_MAP ? (typeof RUNTIME_METRICS_KEY_MAP)[K] : never]: NodeRuntimeMetrics[K];
}, "c" | "m" | "g" | "e"> & {
    c?: EncodedCpu;
    m?: EncodedMemory;
    g?: EncodedGc;
    e?: EncodedEventLoop;
};
export declare class RuntimeMetricsEncoder {
    static encode(metrics: NodeRuntimeMetrics): EncodedNodeRuntimeMetrics;
}
export {};
