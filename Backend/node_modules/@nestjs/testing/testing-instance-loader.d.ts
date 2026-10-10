import { MockFactory } from './interfaces/index.js';
import { TestingInjector } from './testing-injector.js';
import { InstanceLoader, type Module } from '@nestjs/core/internal';
export declare class TestingInstanceLoader extends InstanceLoader<TestingInjector> {
    createInstancesOfDependencies(modules?: Map<string, Module>, mocker?: MockFactory): Promise<void>;
}
