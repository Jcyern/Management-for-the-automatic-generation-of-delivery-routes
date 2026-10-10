/**
 * Loads a builder (webpack/rspack) configuration file, which may be CommonJS,
 * native ESM, or JSON. When `configPath` is the builder's default filename and
 * no such file exists, the project simply has no overrides, so an identity
 * factory is returned; an explicitly configured path that cannot be found is
 * an error.
 */
export declare function loadBuilderConfig<T = any>(configPath: string, defaultPath: string, cwd?: string): Promise<T>;
