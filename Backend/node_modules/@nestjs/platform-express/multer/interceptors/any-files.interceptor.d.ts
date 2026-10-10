import { type NestInterceptor, type Type } from '@nestjs/common';
import { MulterOptions } from '../interfaces/multer-options.interface.js';
/**
 * @param localOptions
 *
 * @publicApi
 */
export declare function AnyFilesInterceptor(localOptions?: MulterOptions): Type<NestInterceptor>;
