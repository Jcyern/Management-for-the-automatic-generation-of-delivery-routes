/**
 * Detect whether the target project uses ESM output.
 * Checks the project's package.json for `"type": "module"`.
 */
export declare function isEsmProject(cwd?: string): boolean;
