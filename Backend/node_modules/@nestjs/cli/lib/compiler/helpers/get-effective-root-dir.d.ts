/**
 * Computes the effective TypeScript rootDir for an emit, mirroring how the
 * TypeScript compiler determines it when `rootDir` is not set in tsconfig.
 *
 * When `rootDir` is explicitly configured, its absolute, normalized form is
 * returned. Otherwise the longest common parent directory of the input file
 * list is used (the same heuristic TypeScript applies through
 * `Program#getCommonSourceDirectory`).
 *
 * Returns `undefined` if no rootDir can be determined (e.g. no input files).
 *
 * @param explicitRootDir Value of `compilerOptions.rootDir` from tsconfig, if any.
 * @param fileNames List of TypeScript input files (absolute paths).
 * @param cwd Current working directory used to resolve relative paths.
 */
export declare function getEffectiveRootDir(explicitRootDir: string | undefined, fileNames: readonly string[] | undefined, cwd?: string): string | undefined;
