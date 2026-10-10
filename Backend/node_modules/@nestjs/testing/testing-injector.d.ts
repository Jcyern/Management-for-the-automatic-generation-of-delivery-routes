import type { NestContainer } from '@nestjs/core';
import type { ContextId } from '@nestjs/core/injector/instance-wrapper.js';
import { MockFactory } from './interfaces/index.js';
import { Injector, type InjectorDependencyContext, InstanceWrapper, type Module } from '@nestjs/core/internal';
interface ResolutionContext {
    contextId: ContextId;
    inquirer?: InstanceWrapper;
    effectiveInquirerId?: string;
}
/**
 * @publicApi
 */
export declare class TestingInjector extends Injector {
    protected mocker?: MockFactory;
    protected container: NestContainer;
    setMocker(mocker: MockFactory): void;
    setContainer(container: NestContainer): void;
    resolveComponentWrapper<T>(moduleRef: Module, name: any, dependencyContext: InjectorDependencyContext, wrapper: InstanceWrapper<T>, resolutionContext?: ResolutionContext, keyOrIndex?: string | number): Promise<InstanceWrapper>;
    resolveComponentHost<T>(moduleRef: Module, instanceWrapper: InstanceWrapper<T>, resolutionContext?: ResolutionContext): Promise<InstanceWrapper>;
    private mockWrapper;
}
export {};
