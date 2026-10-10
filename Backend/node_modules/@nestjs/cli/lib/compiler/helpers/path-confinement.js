import { realpathSync } from 'fs';
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'path';
import { getValueOrDefault } from './get-value-or-default.js';
/**
 * Whether paths are allowed to point outside of the project directory.
 *
 * Confinement is on by default: `compilerOptions.allowOutsidePaths` has to be
 * set to `true` explicitly to build to (or delete) locations outside of the
 * project, which some monorepo layouts legitimately rely on. See
 * nestjs/nest-cli#3463.
 */
export function areOutsidePathsAllowed(configuration, appName) {
    return (getValueOrDefault(configuration, 'compilerOptions.allowOutsidePaths', appName) ?? false);
}
/**
 * Resolves `targetPath` against the project directory and asserts that it stays
 * within it. Returns the resolved absolute path.
 *
 * @throws when the path resolves to the project directory itself or escapes it
 */
export function assertPathInsideProject(targetPath, propertyName, { resolveSymlinks = false, projectRoot = process.cwd(), } = {}) {
    const resolvedPath = resolve(projectRoot, targetPath);
    const comparableRoot = resolveSymlinks
        ? realpathOrClosestExisting(projectRoot)
        : resolve(projectRoot);
    const comparablePath = resolveSymlinks
        ? realpathOrClosestExisting(resolvedPath)
        : resolvedPath;
    const relativePath = relative(comparableRoot, comparablePath);
    const isProjectRoot = relativePath === '';
    const isOutsideProject = relativePath === '..' ||
        relativePath.startsWith(`..${sep}`) ||
        isAbsolute(relativePath);
    if (isProjectRoot || isOutsideProject) {
        throw new Error(`Refusing to use "${propertyName}" path outside of or equal to the project directory: ${targetPath}. ` +
            `Set "compilerOptions.allowOutsidePaths" to true if this is intentional.`);
    }
    return resolvedPath;
}
/**
 * Resolves symlinks in `targetPath`. Output paths routinely do not exist yet, so
 * the closest existing ancestor is resolved instead and the remaining segments
 * are appended back — enough to catch a symlinked ancestor while still working
 * for a directory that is about to be created.
 */
function realpathOrClosestExisting(targetPath) {
    let current = resolve(targetPath);
    const trailingSegments = [];
    for (;;) {
        try {
            return resolve(realpathSync(current), ...trailingSegments);
        }
        catch {
            const parent = dirname(current);
            if (parent === current) {
                // Reached the root without finding an existing path; nothing to resolve.
                return resolve(targetPath);
            }
            trailingSegments.unshift(basename(current));
            current = parent;
        }
    }
}
