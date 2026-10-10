import { Configuration } from '../../configuration/index.js';
/**
 * Whether paths are allowed to point outside of the project directory.
 *
 * Confinement is on by default: `compilerOptions.allowOutsidePaths` has to be
 * set to `true` explicitly to build to (or delete) locations outside of the
 * project, which some monorepo layouts legitimately rely on. See
 * nestjs/nest-cli#3463.
 */
export declare function areOutsidePathsAllowed(configuration: Required<Configuration>, appName: string | undefined): boolean;
export interface PathConfinementOptions {
    /**
     * Resolve symlinks before comparing. Required whenever the path is going to be
     * *written through*: a lexical check alone accepts a path such as "dist" that
     * is itself a symlink pointing outside of the project, and the write would
     * land outside.
     *
     * Deletion does not need it — `fs.rm` unlinks a symlink instead of following
     * it — and turning it on there would reject ordinary setups that legitimately
     * symlink a directory inside the project (a workspace "node_modules", for
     * instance), which is the regression that got the first attempt at this
     * reverted. See nestjs/nest-cli#3460.
     */
    resolveSymlinks?: boolean;
    projectRoot?: string;
}
/**
 * Resolves `targetPath` against the project directory and asserts that it stays
 * within it. Returns the resolved absolute path.
 *
 * @throws when the path resolves to the project directory itself or escapes it
 */
export declare function assertPathInsideProject(targetPath: string, propertyName: string, { resolveSymlinks, projectRoot, }?: PathConfinementOptions): string;
