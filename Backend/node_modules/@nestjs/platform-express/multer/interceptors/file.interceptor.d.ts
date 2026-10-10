import { type NestInterceptor, type Type } from '@nestjs/common';
import { MulterOptions } from '../interfaces/multer-options.interface.js';
/**
 * @param fieldName
 * @param localOptions
 *
 * @publicApi
 */
export declare function FileInterceptor(fieldName: string, localOptions?: MulterOptions): Type<NestInterceptor>;
