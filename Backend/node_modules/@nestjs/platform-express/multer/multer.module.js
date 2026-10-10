var MulterModule_1;
import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { MULTER_MODULE_OPTIONS } from './files.constants.js';
import { MULTER_MODULE_ID } from './multer.constants.js';
import { randomStringGenerator } from '@nestjs/common/internal';
/**
 * @publicApi
 */
let MulterModule = MulterModule_1 = class MulterModule {
    static register(options = {}) {
        return {
            module: MulterModule_1,
            providers: [
                { provide: MULTER_MODULE_OPTIONS, useFactory: () => options },
                {
                    provide: MULTER_MODULE_ID,
                    useValue: randomStringGenerator(),
                },
            ],
            exports: [MULTER_MODULE_OPTIONS],
        };
    }
    static registerAsync(options) {
        return {
            module: MulterModule_1,
            imports: options.imports,
            providers: [
                ...this.createAsyncProviders(options),
                {
                    provide: MULTER_MODULE_ID,
                    useValue: randomStringGenerator(),
                },
            ],
            exports: [MULTER_MODULE_OPTIONS],
        };
    }
    static createAsyncProviders(options) {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: options.useClass,
                useClass: options.useClass,
            },
        ];
    }
    static createAsyncOptionsProvider(options) {
        if (options.useFactory) {
            return {
                provide: MULTER_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        return {
            provide: MULTER_MODULE_OPTIONS,
            useFactory: async (optionsFactory) => optionsFactory.createMulterOptions(),
            inject: [options.useExisting || options.useClass],
        };
    }
};
MulterModule = MulterModule_1 = __decorate([
    Module({})
], MulterModule);
export { MulterModule };
