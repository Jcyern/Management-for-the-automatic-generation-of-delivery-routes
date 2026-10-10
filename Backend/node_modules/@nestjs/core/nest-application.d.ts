import { type CanActivate, type CsrfProtectionOptions, type ExceptionFilter, type HttpServer, type INestApplication, type INestMicroservice, type NestHybridApplicationOptions, type NestInterceptor, type PipeTransform, type SecurityHeadersOptions, type VersioningOptions, type WebSocketAdapter } from '@nestjs/common';
import { AbstractHttpAdapter } from './adapters/index.js';
import { ApplicationConfig } from './application-config.js';
import { NestContainer } from './injector/container.js';
import { GraphInspector } from './inspector/graph-inspector.js';
import { NestApplicationContext } from './nest-application-context.js';
import { type NestApplicationOptions, Logger } from '@nestjs/common';
import { type GlobalPrefixOptions } from '@nestjs/common/internal';
/**
 * @publicApi
 */
export declare class NestApplication extends NestApplicationContext<NestApplicationOptions> implements INestApplication {
    private readonly httpAdapter;
    private readonly config;
    private readonly graphInspector;
    protected readonly logger: Logger;
    private readonly middlewareModule;
    private readonly middlewareContainer;
    private microservicesModule;
    private socketModule;
    private readonly routesResolver;
    private readonly microservices;
    private httpServer;
    private isListening;
    private isWsModuleRegistered;
    private readonly enabledSecurityFeatures;
    private securityHook?;
    constructor(container: NestContainer, httpAdapter: HttpServer, config: ApplicationConfig, graphInspector: GraphInspector, appOptions?: NestApplicationOptions);
    protected prepareClose(): Promise<void>;
    protected dispose(): Promise<void>;
    getHttpAdapter(): AbstractHttpAdapter;
    registerHttpServer(): void;
    getUnderlyingHttpServer<T>(): T;
    applyOptions(): void;
    createServer<T = any>(): T;
    registerModules(): Promise<void>;
    registerWsModule(): Promise<void>;
    init(): Promise<this>;
    registerParserMiddleware(): void;
    registerRouter(): Promise<void>;
    registerRouterHooks(): Promise<void>;
    connectMicroservice<T extends object>(microserviceOptions: T, hybridAppOptions?: NestHybridApplicationOptions): INestMicroservice;
    getMicroservices(): INestMicroservice[];
    getHttpServer(): any;
    startAllMicroservices(): Promise<this>;
    use(...args: [any, any?]): this;
    useBodyParser(...args: [any, any?]): this;
    enableCors(options?: any): void;
    enableCsrfProtection(options?: CsrfProtectionOptions): this;
    useSecurityHeaders(options?: SecurityHeadersOptions): this;
    enableVersioning(options?: VersioningOptions): this;
    listen(port: number | string): Promise<any>;
    listen(port: number | string, hostname: string): Promise<any>;
    getUrl(): Promise<string>;
    private formatAddress;
    setGlobalPrefix(prefix: string, options?: GlobalPrefixOptions): this;
    useWebSocketAdapter(adapter: WebSocketAdapter): this;
    useGlobalFilters(...filters: ExceptionFilter[]): this;
    useGlobalPipes(...pipes: PipeTransform<any>[]): this;
    useGlobalInterceptors(...interceptors: NestInterceptor[]): this;
    useGlobalGuards(...guards: CanActivate[]): this;
    useStaticAssets(options: any): this;
    useStaticAssets(path: string, options?: any): this;
    setBaseViewsDir(path: string | string[]): this;
    setViewEngine(engineOrOptions: any): this;
    /**
     * Pre-load optional packages so that createNestApplication,
     * createNestMicroservice and createHttpAdapter can stay synchronous.
     */
    preloadLazyPackages(): Promise<void>;
    /**
     * Builds the cookie signer from the `cookies.secret` option and shares it
     * between the route params factory (through the config), which verifies
     * signed cookies, and the HTTP adapter, which signs them in `setCookie()`.
     */
    private applyCookiesOptions;
    private host;
    private getProtocol;
    /**
     * Request-level security features are installed as a framework middleware
     * or hook. After `init()` it would land behind the routes (Express) or be
     * rejected by the framework (Fastify), leaving routes silently unprotected,
     * so they fail loudly instead. A second call is rejected as well, as it
     * would silently replace the first configuration.
     */
    private assertSecurityFeatureCanBeEnabled;
    /**
     * Both security features share one request hook, so that they run in a
     * fixed order (headers, then the CSRF check) whichever is enabled first.
     * It is registered with the adapter the first time either is enabled,
     * i.e. at that position in the middleware chain.
     */
    private getSecurityHook;
    private registerMiddleware;
    private applyInstanceDecoratorIfRegistered;
    private applyFunctionDecoratorIfRegistered;
    private loadSocketModule;
    private loadMicroservicesModule;
}
