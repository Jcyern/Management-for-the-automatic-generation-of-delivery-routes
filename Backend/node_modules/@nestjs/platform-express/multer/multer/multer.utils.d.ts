import { HttpException } from '@nestjs/common';
import { MulterModuleOptions } from '../interfaces/index.js';
import { MulterOptions } from '../interfaces/multer-options.interface.js';
/**
 * Merges module-level (global) multer options with interceptor-level (local)
 * options. `limits` is merged key-by-key rather than replaced outright, so
 * that a route overriding e.g. `limits.fileSize` doesn't silently drop other
 * global limits (such as `limits.files`) it never intended to touch.
 *
 * `limits` may also be a function of the request (multer >= 2.4.0), which
 * can't be merged key-by-key. In that case (or when only one side defines
 * `limits`) the local value wins outright, matching the pre-merge behaviour.
 */
export declare function mergeMulterOptions(options?: MulterModuleOptions, localOptions?: MulterOptions): MulterModuleOptions;
export declare function transformException(error: (Error & {
    field?: string;
    code?: string;
}) | undefined): HttpException | (Error & {
    field?: string;
    code?: string;
}) | undefined;
