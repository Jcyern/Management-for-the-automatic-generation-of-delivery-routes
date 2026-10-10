import { type NestInterceptor, type Type } from '@nestjs/common';
import { MulterField, MulterOptions } from '../interfaces/multer-options.interface.js';
/**
 * @param uploadFields
 * @param localOptions
 * @publicApi
 */
export declare function FileFieldsInterceptor(uploadFields: MulterField[], localOptions?: MulterOptions): Type<NestInterceptor>;
