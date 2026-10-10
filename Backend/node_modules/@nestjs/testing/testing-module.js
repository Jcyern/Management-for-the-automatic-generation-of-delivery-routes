import { Logger, } from '@nestjs/common';
import { NestApplication, NestApplicationContext, } from '@nestjs/core';
import { tryLoadPackage, loadPackageCached, isFunction, isUndefined, } from '@nestjs/common/internal';
/**
 * @publicApi
 */
export class TestingModule extends NestApplicationContext {
    applicationConfig;
    graphInspector;
    constructor(container, graphInspector, contextModule, applicationConfig, scope = []) {
        const options = {};
        super(container, options, contextModule, scope);
        this.applicationConfig = applicationConfig;
        this.graphInspector = graphInspector;
    }
    /**
     * Pre-load optional packages so that createNestApplication,
     * createNestMicroservice and createHttpAdapter can stay synchronous.
     * Called from TestingModuleBuilder.compile().
     */
    async preloadLazyPackages() {
        await tryLoadPackage('@nestjs/platform-express', () => import('@nestjs/platform-express'));
        await tryLoadPackage('@nestjs/microservices', () => import('@nestjs/microservices'));
    }
    isHttpServer(serverOrOptions) {
        return !!(serverOrOptions && serverOrOptions.patch);
    }
    createNestApplication(serverOrOptions, options) {
        const [httpAdapter, appOptions] = this.isHttpServer(serverOrOptions)
            ? [serverOrOptions, options]
            : [this.createHttpAdapter(), serverOrOptions];
        this.applyLogger(appOptions);
        this.container.setHttpAdapter(httpAdapter);
        const instance = new NestApplication(this.container, httpAdapter, this.applicationConfig, this.graphInspector, appOptions);
        return this.createAdapterProxy(instance, httpAdapter);
    }
    createNestMicroservice(options) {
        const { NestMicroservice } = loadPackageCached('@nestjs/microservices', 'TestingModule');
        this.applyLogger(options);
        return new NestMicroservice(this.container, options, this.graphInspector, this.applicationConfig);
    }
    createHttpAdapter(httpServer) {
        const { ExpressAdapter } = loadPackageCached('@nestjs/platform-express', 'TestingModule');
        return new ExpressAdapter(httpServer);
    }
    applyLogger(options) {
        if (!options || isUndefined(options.logger)) {
            return;
        }
        Logger.overrideLogger(options.logger);
    }
    createAdapterProxy(app, adapter) {
        const proxy = new Proxy(app, {
            get: (receiver, prop) => {
                if (!(prop in receiver) && prop in adapter) {
                    const value = adapter[prop];
                    if (!isFunction(value)) {
                        return value;
                    }
                    // Called on the adapter, as on applications created by NestFactory.
                    // Chainable methods keep returning the application.
                    return (...args) => {
                        const result = value.apply(adapter, args);
                        return result === adapter ? proxy : result;
                    };
                }
                return receiver[prop];
            },
        });
        return proxy;
    }
}
