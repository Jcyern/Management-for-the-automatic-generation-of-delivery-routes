import * as chokidar from 'chokidar';
import { watch as watchFs } from 'fs';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
const DEFAULT_STABILITY_THRESHOLD = 50;
const DEFAULT_POLL_INTERVAL = 10;
const RESCAN_DEBOUNCE = 100;
/**
 * A recursive "fs.watch" only starts delivering once its underlying stream is
 * running, which happens some time after "fs.watch" returns - measurably later
 * on a loaded machine. Anything written in that window produces no event at
 * all, so the tree is diffed a few times while the stream warms up; without
 * this a file added moments after the watch started is never compiled.
 */
const CATCH_UP_SCAN_DELAYS = [100, 500, 1_500];
const REARM_INTERVAL = 500;
const DIRECTORY_EXISTENCE_CHECK_INTERVAL = 1_000;
/**
 * Platforms on which libuv implements `fs.watch(dir, { recursive: true })`
 * natively (FSEvents on macOS, ReadDirectoryChangesW on Windows), so that a
 * whole tree costs a single handle. Everywhere else Node either emulates it in
 * JavaScript (Linux, only since v20.13) or does not support it at all, so
 * chokidar - which is already O(directories) there - stays in charge.
 */
const NATIVE_RECURSIVE_WATCH_PLATFORMS = new Set([
    'darwin',
    'win32',
]);
export function supportsNativeRecursiveWatch(platform = process.platform) {
    return NATIVE_RECURSIVE_WATCH_PLATFORMS.has(platform);
}
/**
 * Watches a directory tree for added and changed files.
 *
 * On macOS chokidar (since v4, which dropped the bundled `fsevents` backend)
 * falls back to `fs.watch` per file, and libuv only uses FSEvents for
 * directories - so every watched file permanently costs a file descriptor and
 * a medium-sized project quickly hits `EMFILE`. A single recursive `fs.watch`
 * over the directory costs one handle for the whole tree instead.
 *
 * See https://github.com/nestjs/nest-cli/issues/3512
 */
export async function watchDirectoryRecursively(dir, options) {
    if (supportsNativeRecursiveWatch()) {
        return new NativeRecursiveDirectoryWatcher(dir, options).start();
    }
    return createChokidarWatcher(dir, options);
}
async function createChokidarWatcher(dir, options) {
    const watcher = chokidar.watch(dir, {
        ignored: (file, stats) => (stats?.isFile() &&
            !matchesExtension(file, options.extensions)),
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: options.stabilityThreshold ?? DEFAULT_STABILITY_THRESHOLD,
            pollInterval: options.pollInterval ?? DEFAULT_POLL_INTERVAL,
        },
    });
    // Chokidar swallows everything it encounters during its initial scan (that
    // is what "ignoreInitial" means), so the watch is only truly active once
    // "ready" has fired. Resolving before that would silently drop every file
    // written in between - the caller has no other signal to wait on.
    await new Promise((resolve) => {
        // Chokidar rethrows an "error" that has no listener; scanning a tree that
        // is being rewritten underneath is not fatal, so it must not take the
        // process down either.
        watcher.on('error', () => resolve());
        watcher.once('ready', () => resolve());
    });
    if (options.onAdd) {
        watcher.on('add', (file) => void options.onAdd(file));
    }
    if (options.onChange) {
        watcher.on('change', (file) => void options.onChange(file));
    }
    return {
        close: () => watcher.close(),
    };
}
function matchesExtension(file, extensions) {
    return extensions.some((extension) => file.endsWith(extension));
}
class NativeRecursiveDirectoryWatcher {
    dir;
    options;
    /** Known files mapped to the modification time we last reported. */
    known = new Map();
    pending = new Map();
    stabilityThreshold;
    pollInterval;
    watcher;
    existenceTimer;
    rearmTimer;
    rescanTimer;
    catchUpTimers = new Set();
    closed = false;
    constructor(dir, options) {
        this.dir = dir;
        this.options = options;
        this.stabilityThreshold =
            options.stabilityThreshold ?? DEFAULT_STABILITY_THRESHOLD;
        this.pollInterval = options.pollInterval ?? DEFAULT_POLL_INTERVAL;
    }
    async start() {
        // Snapshot before arming the watcher so that the files that already exist
        // are not reported, mirroring chokidar's "ignoreInitial".
        await this.scan(false);
        this.arm();
        return this;
    }
    async close() {
        this.closed = true;
        clearTimeout(this.rearmTimer);
        clearTimeout(this.rescanTimer);
        this.clearCatchUpScans();
        for (const { timer } of this.pending.values()) {
            clearTimeout(timer);
        }
        this.pending.clear();
        this.disposeWatcher();
    }
    arm() {
        if (this.closed) {
            return;
        }
        try {
            this.watcher = watchFs(this.dir, { recursive: true }, (_, filename) => this.handleEvent(filename));
        }
        catch {
            // The directory does not exist (yet) - "outDir" is only created by the
            // first successful build - or the platform refused the recursive watch.
            this.scheduleRearm();
            return;
        }
        // A watcher whose directory is removed stops emitting instead of failing,
        // so its liveness is checked separately.
        this.watcher.on('error', () => this.rearm());
        this.existenceTimer = setInterval(() => {
            void stat(this.dir)
                .then((stats) => {
                if (!stats.isDirectory()) {
                    this.rearm();
                }
            })
                .catch(() => this.rearm());
        }, DIRECTORY_EXISTENCE_CHECK_INTERVAL);
        this.existenceTimer.unref?.();
        this.scheduleCatchUpScans();
    }
    scheduleCatchUpScans() {
        for (const delay of CATCH_UP_SCAN_DELAYS) {
            const timer = setTimeout(() => {
                this.catchUpTimers.delete(timer);
                void this.scan(true);
            }, delay);
            timer.unref?.();
            this.catchUpTimers.add(timer);
        }
    }
    clearCatchUpScans() {
        for (const timer of this.catchUpTimers) {
            clearTimeout(timer);
        }
        this.catchUpTimers.clear();
    }
    handleEvent(filename) {
        if (this.closed) {
            return;
        }
        if (!filename) {
            // macOS coalesces some events and reports no filename at all; fall back
            // to diffing the tree.
            this.scheduleRescan();
            return;
        }
        const file = join(this.dir, filename.toString());
        if (!matchesExtension(file, this.options.extensions)) {
            return;
        }
        this.settle(file);
    }
    scheduleRescan() {
        if (this.closed || this.rescanTimer) {
            return;
        }
        this.rescanTimer = setTimeout(() => {
            this.rescanTimer = undefined;
            void this.scan(true);
        }, RESCAN_DEBOUNCE);
        this.rescanTimer.unref?.();
    }
    /**
     * Walks the tree and, when `emit` is set, reports the files that were added
     * or modified since the last walk. Reading the tree does not hold any handle.
     */
    async scan(emit) {
        let entries;
        try {
            entries = await readdir(this.dir, {
                recursive: true,
                withFileTypes: true,
            });
        }
        catch {
            // Directory is gone; everything it held counts as removed.
            this.known.clear();
            return;
        }
        if (this.closed) {
            return;
        }
        const seen = new Set();
        for (const entry of entries) {
            if (!entry.isFile()) {
                continue;
            }
            const file = join(entry.parentPath ?? entry.path, entry.name);
            if (!matchesExtension(file, this.options.extensions)) {
                continue;
            }
            seen.add(file);
            const mtimeMs = await stat(file)
                .then((stats) => stats.mtimeMs)
                .catch(() => undefined);
            if (mtimeMs === undefined) {
                continue;
            }
            if (!emit) {
                this.known.set(file, mtimeMs);
                continue;
            }
            if (this.known.get(file) !== mtimeMs) {
                this.settle(file);
            }
        }
        for (const file of this.known.keys()) {
            if (!seen.has(file)) {
                this.known.delete(file);
            }
        }
    }
    /**
     * Delays reporting until the file stopped growing, so that a half-written
     * file is never handed over to the compiler.
     */
    settle(file) {
        const pending = this.pending.get(file);
        if (pending) {
            clearTimeout(pending.timer);
        }
        const state = {
            size: -1,
            stableSince: Date.now(),
            timer: undefined,
        };
        state.timer = setTimeout(() => void this.poll(file), this.pollInterval);
        this.pending.set(file, state);
    }
    async poll(file) {
        const state = this.pending.get(file);
        if (this.closed || !state) {
            return;
        }
        const stats = await stat(file).catch(() => undefined);
        if (this.closed) {
            return;
        }
        if (!stats) {
            // Removed (or renamed away) before it settled.
            this.pending.delete(file);
            this.known.delete(file);
            return;
        }
        const now = Date.now();
        if (stats.size !== state.size) {
            state.size = stats.size;
            state.stableSince = now;
        }
        if (now - state.stableSince >= this.stabilityThreshold) {
            this.pending.delete(file);
            this.emit(file, stats.mtimeMs);
            return;
        }
        state.timer = setTimeout(() => void this.poll(file), this.pollInterval);
    }
    emit(file, mtimeMs) {
        const isKnown = this.known.has(file);
        this.known.set(file, mtimeMs);
        if (isKnown) {
            void this.options.onChange?.(file);
        }
        else {
            void this.options.onAdd?.(file);
        }
    }
    rearm() {
        if (this.closed) {
            return;
        }
        this.disposeWatcher();
        this.known.clear();
        this.scheduleRearm();
    }
    scheduleRearm() {
        if (this.closed || this.rearmTimer) {
            return;
        }
        this.rearmTimer = setTimeout(() => {
            this.rearmTimer = undefined;
            if (this.closed) {
                return;
            }
            void stat(this.dir)
                .then(async (stats) => {
                if (!stats.isDirectory()) {
                    this.scheduleRearm();
                    return;
                }
                this.arm();
                // The tree may have been (re)populated while unwatched.
                await this.scan(true);
            })
                .catch(() => this.scheduleRearm());
        }, REARM_INTERVAL);
        this.rearmTimer.unref?.();
    }
    disposeWatcher() {
        this.clearCatchUpScans();
        clearInterval(this.existenceTimer);
        this.existenceTimer = undefined;
        this.watcher?.close();
        this.watcher = undefined;
    }
}
