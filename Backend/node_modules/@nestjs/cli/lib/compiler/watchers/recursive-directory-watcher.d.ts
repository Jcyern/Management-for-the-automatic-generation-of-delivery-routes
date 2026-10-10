export interface RecursiveDirectoryWatcherOptions {
    /**
     * File suffixes to report events for, e.g. `['.ts']`. Matched with
     * `String#endsWith`, so both `ts` and `.ts` are accepted.
     */
    extensions: string[];
    /**
     * Called with the path of a file that appeared after the initial scan.
     */
    onAdd?: (file: string) => unknown;
    /**
     * Called with the path of a file that was modified after the initial scan.
     */
    onChange?: (file: string) => unknown;
    /**
     * Equivalent of chokidar's "awaitWriteFinish": an event is only reported
     * once the file size stopped changing for that many milliseconds.
     */
    stabilityThreshold?: number;
    pollInterval?: number;
}
export interface RecursiveDirectoryWatcher {
    close(): Promise<void>;
}
export declare function supportsNativeRecursiveWatch(platform?: string): boolean;
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
export declare function watchDirectoryRecursively(dir: string, options: RecursiveDirectoryWatcherOptions): Promise<RecursiveDirectoryWatcher>;
