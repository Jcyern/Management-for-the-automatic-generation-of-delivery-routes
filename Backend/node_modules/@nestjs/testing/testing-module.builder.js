import { Logger, Module, } from '@nestjs/common';
import { TestingLogger } from './services/testing-logger.service.js';
import { TestingInjector } from './testing-injector.js';
import { TestingInstanceLoader } from './testing-instance-loader.js';
import { TestingModule } from './testing-module.js';
import { ApplicationConfig, NestContainer, GraphInspector, } from '@nestjs/core';
import { NoopGraphInspector, UuidFactory, UuidFactoryMode, DependenciesScanner, } from '@nestjs/core/internal';
/**
 * @publicApi
 */
export class TestingModuleBuilder {
    metadataScanner;
    applicationConfig = new ApplicationConfig();
    container;
    overloadsMap = new Map();
    moduleOverloadsMap = new Map();
    module;
    testingLogger;
    mocker;
    constructor(metadataScanner, metadata, options) {
        this.metadataScanner = metadataScanner;
        this.container = new NestContainer(this.applicationConfig, options);
        this.module = this.createModule(metadata);
    }
    setLogger(testingLogger) {
        this.testingLogger = testingLogger;
        return this;
    }
    overridePipe(typeOrToken) {
        return this.override(typeOrToken, false);
    }
    useMocker(mocker) {
        this.mocker = mocker;
        return this;
    }
    overrideFilter(typeOrToken) {
        return this.override(typeOrToken, false);
    }
    overrideGuard(typeOrToken) {
        return this.override(typeOrToken, false);
    }
    overrideInterceptor(typeOrToken) {
        return this.override(typeOrToken, false);
    }
    overrideProvider(typeOrToken) {
        return this.override(typeOrToken, true);
    }
    overrideModule(moduleToOverride) {
        return {
            useModule: newModule => {
                this.moduleOverloadsMap.set(moduleToOverride, newModule);
                return this;
            },
        };
    }
    async compile(options = {}) {
        this.applyLogger();
        let graphInspector;
        if (options?.snapshot) {
            graphInspector = new GraphInspector(this.container);
            UuidFactory.mode = UuidFactoryMode.Deterministic;
        }
        else {
            graphInspector = NoopGraphInspector;
            UuidFactory.mode = UuidFactoryMode.Random;
        }
        const scanner = new DependenciesScanner(this.container, this.metadataScanner, graphInspector, this.applicationConfig);
        await scanner.scan(this.module, {
            overrides: this.getModuleOverloads(),
        });
        this.applyOverloadsMap();
        await this.createInstancesOfDependencies(graphInspector, options);
        scanner.applyApplicationProviders();
        const root = this.getRootModule();
        const testingModule = new TestingModule(this.container, graphInspector, root, this.applicationConfig);
        await testingModule['preloadLazyPackages']();
        return testingModule;
    }
    override(typeOrToken, isProvider) {
        const addOverload = (options) => {
            this.overloadsMap.set(typeOrToken, {
                ...options,
                isProvider,
            });
            return this;
        };
        return this.createOverrideByBuilder(addOverload);
    }
    createOverrideByBuilder(add) {
        return {
            useValue: value => add({ useValue: value }),
            useFactory: (options) => add({ ...options, useFactory: options.factory }),
            useClass: metatype => add({ useClass: metatype }),
        };
    }
    applyOverloadsMap() {
        const overloads = [...this.overloadsMap.entries()];
        overloads.forEach(([item, options]) => {
            this.container.replace(item, options);
        });
    }
    getModuleOverloads() {
        const overloads = [...this.moduleOverloadsMap.entries()];
        return overloads.map(([moduleToReplace, newModule]) => ({
            moduleToReplace,
            newModule,
        }));
    }
    getRootModule() {
        const modules = this.container.getModules().values();
        return modules.next().value;
    }
    async createInstancesOfDependencies(graphInspector, options) {
        const injector = new TestingInjector({
            preview: options?.preview ?? false,
            snapshot: options?.snapshot ?? false,
        });
        const instanceLoader = new TestingInstanceLoader(this.container, injector, graphInspector);
        await instanceLoader.createInstancesOfDependencies(this.container.getModules(), this.mocker);
    }
    createModule(metadata) {
        class RootTestModule {
        }
        Module(metadata)(RootTestModule);
        return RootTestModule;
    }
    applyLogger() {
        Logger.overrideLogger(this.testingLogger || new TestingLogger());
    }
}
