var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NodeRuntimeMetricsService_1;
import { Inject, Injectable, Logger, } from "@nestjs/common";
import * as os from "node:os";
import { monitorEventLoopDelay, performance, PerformanceObserver, } from "node:perf_hooks";
import { OBSERVE_OPTIONS } from "../observe.constants.js";
let NodeRuntimeMetricsService = NodeRuntimeMetricsService_1 = class NodeRuntimeMetricsService {
    options;
    logger = new Logger(NodeRuntimeMetricsService_1.name);
    eventLoopDelayMonitor = null;
    gcObserver = null;
    gcCount = 0;
    gcTotalDuration = 0;
    gcBreakdown = null;
    // Seeded here rather than in `onModuleInit`, which never runs when runtime
    // metrics are disabled and returns early before setting them. A sample taken
    // in that window used to difference against `null`, which reads as the epoch
    // and pins CPU usage at ~0%.
    lastCpuUsage = process.cpuUsage();
    lastCpuUsageTimestamp = Date.now();
    osTotalMemory = os.totalmem();
    constructor(options) {
        this.options = options;
        this.options.runtimeMetrics ??= true;
    }
    onModuleInit() {
        if (!this.options.runtimeMetrics) {
            return;
        }
        this.lastCpuUsage = process.cpuUsage();
        this.lastCpuUsageTimestamp = Date.now();
        this.osTotalMemory = os.totalmem();
        this.monitorEventLoopDelay();
        this.observeGcPerformance();
    }
    async onApplicationShutdown() {
        if (this.gcObserver) {
            this.gcObserver.disconnect();
            this.logger.debug("Garbage collection observer disconnected.");
        }
        if (this.eventLoopDelayMonitor) {
            this.eventLoopDelayMonitor.disable();
            this.logger.debug("Event loop delay monitoring disabled.");
        }
    }
    monitorEventLoopDelay() {
        if (this.options.debug) {
            this.logger.debug("Monitoring event loop delay.");
        }
        const h = monitorEventLoopDelay();
        h.enable();
        this.eventLoopDelayMonitor = h;
    }
    observeGcPerformance() {
        if (this.options.debug) {
            this.logger.debug("Observing garbage collection performance.");
        }
        this.gcObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType !== "gc") {
                    continue;
                }
                this.gcCount++;
                this.gcTotalDuration += entry.duration;
                if ("detail" in entry && "kind" in entry.detail) {
                    const detail = entry.detail;
                    const kind = detail.kind === 1
                        ? "major"
                        : detail.kind === 2
                            ? "minor"
                            : detail.kind === 4
                                ? "incremental"
                                : undefined;
                    if (!kind) {
                        continue;
                    }
                    // Seeded with all three kinds at zero on the first collection of the
                    // window: "no major collections happened" and "major collections were
                    // not reported" are different facts, and only the seeding keeps them
                    // apart downstream.
                    this.gcBreakdown ??= {
                        minor: { count: 0, duration: 0 },
                        major: { count: 0, duration: 0 },
                        incremental: { count: 0, duration: 0 },
                    };
                    const bucket = (this.gcBreakdown[kind] ??= {
                        count: 0,
                        duration: 0,
                    });
                    bucket.count++;
                    bucket.duration += entry.duration;
                }
            }
        });
        this.gcObserver.observe({ type: "gc", buffered: true });
    }
    collectNodeRuntimeMetrics() {
        // Nothing was started, so there is nothing to collect: with metrics turned
        // off the histogram is never enabled, and every number below would be
        // fabricated. This used to surface as a TypeError from dereferencing the
        // absent monitor; it is stated outright so the reason survives.
        if (!this.eventLoopDelayMonitor) {
            throw new Error("Runtime metrics are not being collected. `collectNodeRuntimeMetrics()` requires `onModuleInit()` to have run with the `runtimeMetrics` option enabled.");
        }
        const timestamp = Date.now();
        const elapsedTime = timestamp - this.lastCpuUsageTimestamp;
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        const diffCpuUsage = process.cpuUsage(this.lastCpuUsage);
        const eventLoop = performance.eventLoopUtilization();
        // `mean` is NaN until the histogram has recorded its first sample, so a
        // flush that lands immediately after startup would otherwise ship NaN into
        // a numeric column - where it survives, poisons every average built over it
        // and makes the runtime alert comparisons undefined.
        const meanDelay = this.eventLoopDelayMonitor.mean;
        const lag = Number.isFinite(meanDelay) ? meanDelay / 1e6 : 0; // ns → ms
        const metrics = {
            memory: {
                rss: memoryUsage.rss / 1024 / 1024, // Convert bytes to MB
                heapTotal: memoryUsage.heapTotal / 1024 / 1024, // Convert bytes to MB
                heapUsed: memoryUsage.heapUsed / 1024 / 1024, // Convert bytes to MB
                external: memoryUsage.external / 1024 / 1024, // Convert bytes to MB
                arrayBuffers: memoryUsage.arrayBuffers / 1024 / 1024, // Convert bytes to MB
                percentageUsed: (memoryUsage.rss / this.osTotalMemory) * 100,
            },
            cpu: {
                user: diffCpuUsage.user / 1000, // Convert from µs to ms
                system: diffCpuUsage.system / 1000, // Convert from µs to ms
                percentageUsed: ((diffCpuUsage.user + diffCpuUsage.system) / 1000 / elapsedTime) *
                    100,
            },
            eventLoop: {
                lag,
                utilization: eventLoop.utilization,
            },
            gc: {
                count: this.gcCount,
                totalDuration: this.gcTotalDuration,
                breakdown: { ...this.gcBreakdown },
            },
        };
        this.resetGcMetrics();
        this.updateLastCpuUsage(cpuUsage, timestamp);
        return metrics;
    }
    resetGcMetrics() {
        this.gcCount = 0;
        this.gcTotalDuration = 0;
        this.gcBreakdown = null;
    }
    updateLastCpuUsage(cpuUsage, timestamp) {
        this.lastCpuUsage = cpuUsage;
        this.lastCpuUsageTimestamp = timestamp;
    }
};
NodeRuntimeMetricsService = NodeRuntimeMetricsService_1 = __decorate([
    Injectable(),
    __param(0, Inject(OBSERVE_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], NodeRuntimeMetricsService);
export { NodeRuntimeMetricsService };
