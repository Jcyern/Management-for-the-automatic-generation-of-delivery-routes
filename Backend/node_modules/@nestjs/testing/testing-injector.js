import { STATIC_CONTEXT, Injector, InstanceWrapper, } from '@nestjs/core/internal';
/**
 * @publicApi
 */
export class TestingInjector extends Injector {
    mocker;
    container;
    setMocker(mocker) {
        this.mocker = mocker;
    }
    setContainer(container) {
        this.container = container;
    }
    async resolveComponentWrapper(moduleRef, name, dependencyContext, wrapper, resolutionContext = { contextId: STATIC_CONTEXT }, keyOrIndex) {
        try {
            const existingProviderWrapper = await super.resolveComponentWrapper(moduleRef, name, dependencyContext, wrapper, resolutionContext, keyOrIndex);
            return existingProviderWrapper;
        }
        catch (err) {
            return this.mockWrapper(err, moduleRef, name, wrapper);
        }
    }
    async resolveComponentHost(moduleRef, instanceWrapper, resolutionContext = { contextId: STATIC_CONTEXT }) {
        try {
            const existingProviderWrapper = await super.resolveComponentHost(moduleRef, instanceWrapper, resolutionContext);
            return existingProviderWrapper;
        }
        catch (err) {
            return this.mockWrapper(err, moduleRef, instanceWrapper.name, instanceWrapper);
        }
    }
    async mockWrapper(err, moduleRef, name, wrapper) {
        if (!this.mocker) {
            throw err;
        }
        const mockedInstance = this.mocker(name);
        if (!mockedInstance) {
            throw err;
        }
        const newWrapper = new InstanceWrapper({
            name,
            isAlias: false,
            scope: wrapper.scope,
            instance: mockedInstance,
            isResolved: true,
            host: moduleRef,
            metatype: wrapper.metatype,
        });
        const internalCoreModule = this.container.getInternalCoreModuleRef();
        if (!internalCoreModule) {
            throw new Error('Expected to have internal core module reference at this point.');
        }
        internalCoreModule.addCustomProvider({
            provide: name,
            useValue: mockedInstance,
        }, internalCoreModule.providers);
        internalCoreModule.addExportedProviderOrModule(name);
        return newWrapper;
    }
}
