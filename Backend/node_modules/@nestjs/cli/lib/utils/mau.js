import { existsSync, readFileSync } from 'fs';
import { createRequire } from 'module';
import { dirname, join } from 'path';
const require = createRequire(import.meta.url);
export const MAU_PACKAGE_NAME = '@nestjs/mau';
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
export function findMauBinary(cwd = process.cwd()) {
    const searchPaths = [
        cwd,
        join(cwd, 'node_modules'),
        ...(require.resolve.paths(MAU_PACKAGE_NAME) ?? []),
    ];
    let packageJsonPath;
    try {
        packageJsonPath = require.resolve(`${MAU_PACKAGE_NAME}/package.json`, {
            paths: searchPaths,
        });
    }
    catch {
        return undefined;
    }
    let bin;
    try {
        bin = JSON.parse(readFileSync(packageJsonPath, 'utf8')).bin;
    }
    catch {
        return undefined;
    }
    const relativeBinPath = typeof bin === 'string' ? bin : (bin?.mau ?? Object.values(bin ?? {})[0]);
    if (!relativeBinPath) {
        return undefined;
    }
    const binaryPath = join(dirname(packageJsonPath), relativeBinPath);
    return existsSync(binaryPath) ? binaryPath : undefined;
}
