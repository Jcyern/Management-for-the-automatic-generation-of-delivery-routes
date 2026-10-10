export declare const MAU_PACKAGE_NAME = "@nestjs/mau";
/**
 * Resolves the `mau` executable shipped by `@nestjs/mau`, looking in the
 * user's project first and then next to the CLI itself.
 *
 * The path comes from the package's own `bin` field rather than a hardcoded
 * `node_modules/.bin/mau`: that shim is absent under pnpm's layout, lives in a
 * parent directory in hoisted monorepos, and is not directly executable on
 * Windows.
 *
 * @returns The absolute path to the executable, or `undefined` when
 * `@nestjs/mau` is not installed.
 */
export declare function findMauBinary(cwd?: string): string | undefined;
