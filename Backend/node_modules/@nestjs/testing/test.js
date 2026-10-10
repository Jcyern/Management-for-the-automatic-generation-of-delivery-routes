import { TestingModuleBuilder, } from './testing-module.builder.js';
import { MetadataScanner } from '@nestjs/core';
export class Test {
    static metadataScanner = new MetadataScanner();
    static createTestingModule(metadata, options) {
        return new TestingModuleBuilder(this.metadataScanner, metadata, options);
    }
}
