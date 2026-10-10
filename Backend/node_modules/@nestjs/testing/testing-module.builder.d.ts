import { type LoggerService, type ModuleMetadata } from '@nestjs/common';
import { MockFactory, OverrideBy } from './interfaces/index.js';
import { OverrideModule } from './interfaces/override-module.interface.js';
import { TestingModule } from './testing-module.js';
import type { NestApplicationContextOptions } from '@nestjs/common/internal';
import { type MetadataScanner } from '@nestjs/core';
import { type ModuleDefinition } from '@nestjs/core/internal';
/**
 * @publicApi
 */
export type TestingModuleOptions = Pick<NestApplicationContextOptions, 'moduleIdGeneratorAlgorithm'>;
/**
 * @publicApi
 */
export declare class TestingModuleBuilder {
    private readonly metadataScanner;
    private readonly applicationConfig;
    private readonly container;
    private readonly overloadsMap;
    private readonly moduleOverloadsMap;
    private readonly module;
    private testingLogger;
    private mocker?;
    constructor(metadataScanner: MetadataScanner, metadata: ModuleMetadata, options?: TestingModuleOptions);
    setLogger(testingLogger: LoggerService): this;
    overridePipe<T = any>(typeOrToken: T): OverrideBy;
    useMocker(mocker: MockFactory): TestingModuleBuilder;
    overrideFilter<T = any>(typeOrToken: T): OverrideBy;
    overrideGuard<T = any>(typeOrToken: T): OverrideBy;
    overrideInterceptor<T = any>(typeOrToken: T): OverrideBy;
    overrideProvider<T = any>(typeOrToken: T): OverrideBy;
    overrideModule(moduleToOverride: ModuleDefinition): OverrideModule;
    compile(options?: Pick<NestApplicationContextOptions, 'snapshot' | 'preview'>): Promise<TestingModule>;
    private override;
    private createOverrideByBuilder;
    private applyOverloadsMap;
    private getModuleOverloads;
    private getRootModule;
    private createInstancesOfDependencies;
    private createModule;
    private applyLogger;
}
