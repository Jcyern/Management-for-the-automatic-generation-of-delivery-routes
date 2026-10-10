import { TestingModuleBuilder, TestingModuleOptions } from './testing-module.builder.js';
import type { ModuleMetadata } from '@nestjs/common';
export declare class Test {
    private static readonly metadataScanner;
    static createTestingModule(metadata: ModuleMetadata, options?: TestingModuleOptions): TestingModuleBuilder;
}
