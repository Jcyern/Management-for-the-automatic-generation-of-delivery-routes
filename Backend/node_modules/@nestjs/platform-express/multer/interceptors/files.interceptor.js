import { __decorate, __metadata, __param } from "tslib";
import { Inject, mixin, Optional, } from '@nestjs/common';
import multer from 'multer';
import { MULTER_MODULE_OPTIONS } from '../files.constants.js';
import { mergeMulterOptions, transformException, } from '../multer/multer.utils.js';
/**
 *
 * @param fieldName
 * @param maxCount
 * @param localOptions
 *
 * @publicApi
 */
export function FilesInterceptor(fieldName, maxCount, localOptions) {
    let MixinInterceptor = class MixinInterceptor {
        multer;
        constructor(options = {}) {
            this.multer = multer(mergeMulterOptions(options, localOptions));
        }
        async intercept(context, next) {
            const ctx = context.switchToHttp();
            await new Promise((resolve, reject) => this.multer.array(fieldName, maxCount)(ctx.getRequest(), ctx.getResponse(), (err) => {
                if (err) {
                    const error = transformException(err);
                    return reject(error);
                }
                resolve();
            }));
            return next.handle();
        }
    };
    MixinInterceptor = __decorate([
        __param(0, Optional()),
        __param(0, Inject(MULTER_MODULE_OPTIONS)),
        __metadata("design:paramtypes", [Object])
    ], MixinInterceptor);
    const Interceptor = mixin(MixinInterceptor);
    return Interceptor;
}
