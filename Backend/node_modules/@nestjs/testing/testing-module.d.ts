import { type HttpServer, type INestApplication, type INestMicroservice, type NestApplicationOptions, type Type } from '@nestjs/common';
import { type AbstractHttpAdapter, NestApplicationContext } from '@nestjs/core';
import { type NestMicroserviceOptions } from '@nestjs/common/internal';
import type { ApplicationConfig, NestContainer, GraphInspector } from '@nestjs/core';
import type { Module } from '@nestjs/core/internal';
/**
 * @publicApi
 */
export declare class TestingModule extends NestApplicationContext {
    private readonly applicationConfig;
    protected readonly graphInspector: GraphInspector;
    constructor(container: NestContainer, graphInspector: GraphInspector, contextModule: Module, applicationConfig: ApplicationConfig, scope?: Type<any>[]);
    /**
     * Pre-load optional packages so that createNestApplication,
     * createNestMicroservice and createHttpAdapter can stay synchronous.
     * Called from TestingModuleBuilder.compile().
     */
    private preloadLazyPackages;
    private isHttpServer;
    createNestApplication<T extends INestApplication = INestApplication>(httpAdapter: HttpServer | AbstractHttpAdapter, options?: NestApplicationOptions): T;
    createNestApplication<T extends INestApplication = INestApplication>(options?: NestApplicationOptions): T;
    createNestMicroservice<T extends object>(options: NestMicroserviceOptions & T): INestMicroservice;
    private createHttpAdapter;
    private applyLogger;
    private createAdapterProxy;
}
