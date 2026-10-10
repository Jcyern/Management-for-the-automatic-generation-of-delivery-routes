/**
 * Resolves `path` through Node's module resolution, returning the resolved
 * filename or `undefined` when it cannot be found. Callers need the resolved
 * path itself (to decide how to load the file), not merely whether it exists.
 */
export declare function resolveModulePath(path: string): string | undefined;
