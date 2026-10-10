export interface GlobSyncOptions {
    /** A single glob pattern; every path matching it is removed from the result. */
    ignore?: string;
    /** When true, `*` and `**` also match entries whose name starts with a dot. */
    dot?: boolean;
}
export interface GlobEntry {
    /** Absolute path, always `/`-separated regardless of platform. */
    path: string;
    isFile: boolean;
    isDirectory: boolean;
}
/**
 * Expands `pattern` to every matching path, with the type of each entry.
 * See the file header for the compatibility rules this preserves.
 */
export declare function globEntriesSync(pattern: string, options?: GlobSyncOptions): GlobEntry[];
/** Expands `pattern` to every matching path. */
export declare function globSync(pattern: string, options?: GlobSyncOptions): string[];
