import { type NestInterceptor, type Type } from '@nestjs/common';
import { MulterOptions } from '../interfaces/multer-options.interface.js';
/**
 *
 * @param fieldName
 * @param maxCount
 * @param localOptions
 *
 * @publicApi
 */
export declare function FilesInterceptor(fieldName: string, maxCount?: number, localOptions?: MulterOptions): Type<NestInterceptor>;
