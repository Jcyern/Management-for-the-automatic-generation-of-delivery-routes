import { serializeCookie } from '../helpers/cookies/serialize-cookie.js';
/**
 * Base class for HTTP platform adapters (see `ExpressAdapter` and
 * `FastifyAdapter` for reference implementations).
 *
 * It implements the {@link HttpServer} contract that the Nest core relies on,
 * and that interface is where each method's calling conventions are
 * documented: when the core invokes it, with which arguments, and what it
 * expects back. This class only adds:
 *
 * - default implementations that delegate to the wrapped framework
 *   `instance` (`use()`, the HTTP-verb methods, `listen()`) or are inert
 *   (`init()`, `normalizePath()`, `mapException()`, `beforeClose()`, the
 *   `setOn*Hook()` setters), plus an Express-style, `use()`-based
 *   `registerSecurityHook()`;
 * - storage for the native server (`httpServer`) and the framework instance
 *   (`instance`), with their accessors;
 * - `setCookie()` and `clearCookie()`, implemented once on top of
 *   `appendHeader()`, so they behave the same on every platform;
 * - the introspection hooks used by instrumentation tooling.
 *
 * Every remaining {@link HttpServer} member is declared abstract here, even
 * the ones the interface marks optional, so subclasses cannot forget them.
 * `setBaseViewsDir()`, `useBodyParser()` and `isRouteOrderSensitive()` are
 * not declared on this class; implement them when the platform supports
 * them (see {@link HttpServer} for what the core does when they are absent).
 *
 * Keep in mind that the core also reads and writes properties of the request
 * object (`body`, `params`, `query`, `headers`, ...), that Server-Sent Events
 * write directly to the Node.js response, and that `app.listen()` and the
 * WebSocket adapters use the value returned by
 * {@link AbstractHttpAdapter.getHttpServer} as a Node.js `net.Server`; see the
 * {@link HttpServer} documentation for details.
 *
 * @typeParam TServer - Type of the native HTTP server stored in `httpServer`
 * (e.g. `http.Server | https.Server`).
 * @typeParam TRequest - Type of the framework request object.
 * @typeParam TResponse - Type of the framework response object.
 *
 * @see [HTTP adapter](https://docs.nestjs.com/faq/http-adapter)
 *
 * @publicApi
 */
export class AbstractHttpAdapter {
    instance;
    /**
     * Native HTTP server created by {@link AbstractHttpAdapter.initHttpServer}
     * and returned by {@link AbstractHttpAdapter.getHttpServer}.
     */
    httpServer;
    /**
     * Callback registered through
     * {@link AbstractHttpAdapter.setOnRouteTriggered}, if any.
     */
    onRouteTriggered;
    /**
     * Signer built from the `cookies.secret` application option, used by
     * {@link AbstractHttpAdapter.setCookie} for `signed` cookies.
     */
    cookieSigner;
    /**
     * @param instance The framework application instance to delegate to (e.g.
     * an Express `Application`). Subclasses typically create a default one
     * when none is given.
     */
    constructor(instance) {
        this.instance = instance;
    }
    /**
     * Asynchronous setup hook, awaited by `NestFactory.create()` and again by
     * `app.init()`, so overrides must be idempotent. No-op by default.
     *
     * @see {@link HttpServer.init}
     */
    async init() { }
    /**
     * Registers a global middleware by delegating to `instance.use(...args)`.
     *
     * @see {@link HttpServer.use}
     */
    use(...args) {
        return this.instance.use(...args);
    }
    get(...args) {
        return this.instance.get(...args);
    }
    post(...args) {
        return this.instance.post(...args);
    }
    head(...args) {
        return this.instance.head(...args);
    }
    delete(...args) {
        return this.instance.delete(...args);
    }
    put(...args) {
        return this.instance.put(...args);
    }
    patch(...args) {
        return this.instance.patch(...args);
    }
    propfind(...args) {
        return this.instance.propfind(...args);
    }
    proppatch(...args) {
        return this.instance.proppatch(...args);
    }
    mkcol(...args) {
        return this.instance.mkcol(...args);
    }
    copy(...args) {
        return this.instance.copy(...args);
    }
    move(...args) {
        return this.instance.move(...args);
    }
    lock(...args) {
        return this.instance.lock(...args);
    }
    unlock(...args) {
        return this.instance.unlock(...args);
    }
    all(...args) {
        return this.instance.all(...args);
    }
    search(...args) {
        return this.instance.search(...args);
    }
    query(...args) {
        return this.instance.query(...args);
    }
    options(...args) {
        return this.instance.options(...args);
    }
    listen(port, hostname, callback) {
        return this.instance.listen(port, hostname, callback);
    }
    /**
     * Returns the native HTTP server stored by
     * {@link AbstractHttpAdapter.initHttpServer} (or
     * {@link AbstractHttpAdapter.setHttpServer}).
     *
     * @see {@link HttpServer.getHttpServer}
     */
    getHttpServer() {
        return this.httpServer;
    }
    /**
     * Replaces the native HTTP server returned by
     * {@link AbstractHttpAdapter.getHttpServer}. Mostly useful for tests and
     * for adapters that obtain the server from elsewhere.
     */
    setHttpServer(httpServer) {
        this.httpServer = httpServer;
    }
    /**
     * Replaces the framework application instance that the default method
     * implementations delegate to.
     */
    setInstance(instance) {
        this.instance = instance;
    }
    /**
     * Returns the framework application instance passed to the constructor
     * (or set through {@link AbstractHttpAdapter.setInstance}).
     *
     * @see {@link HttpServer.getInstance}
     */
    getInstance() {
        return this.instance;
    }
    /**
     * Converts and validates a route path before registration. Returns the
     * path unchanged by default; override to translate Nest's path syntax to
     * the router's and to throw on invalid paths.
     *
     * @see {@link HttpServer.normalizePath}
     */
    normalizePath(path) {
        return path;
    }
    /**
     * Registers a callback that the router invokes right before each route
     * handler runs, with the resolved `RequestMethod` and the route path as
     * declared (before {@link AbstractHttpAdapter.normalizePath}). The router
     * wraps every handler at registration time, so the callback must be set
     * before `app.init()` to take effect. Intended for instrumentation and
     * devtools; there is no need to override it.
     */
    setOnRouteTriggered(onRouteTriggered) {
        this.onRouteTriggered = onRouteTriggered;
    }
    /**
     * Returns the callback registered through
     * {@link AbstractHttpAdapter.setOnRouteTriggered}, if any. Read by the
     * router when registering routes.
     */
    getOnRouteTriggered() {
        return this.onRouteTriggered;
    }
    /**
     * Registers a hook to run at the start of every request. No-op by default;
     * the built-in adapters accept a `(req, res, done) => void | Promise<void>`
     * function and call `done()` to continue processing. Intended for
     * instrumentation and devtools.
     */
    setOnRequestHook(onRequestHook) { }
    /**
     * Registers a hook to run once a response has been sent. No-op by default;
     * the built-in adapters accept a `(req, res) => void | Promise<void>`
     * function. Intended for instrumentation and devtools.
     */
    setOnResponseHook(onResponseHook) { }
    /**
     * Called by `app.close()` before the shutdown hooks run. No-op by default;
     * override to enter a "shutting down" state.
     *
     * @see {@link HttpServer.beforeClose}
     */
    beforeClose() { }
    /**
     * Translates a framework-native error into something the exception filters
     * understand. Invoked by the global exception layer with every error it
     * receives, before it reaches the filters; the returned value is what the
     * filters see. Returns the error unchanged by default. The built-in
     * adapters map, for instance, body-parser `SyntaxError`s to
     * `BadRequestException`.
     */
    mapException(error) {
        return error;
    }
    /**
     * Installs the request hook of the built-in HTTP security features as a
     * global middleware (`use()`), which fits Express-like frameworks: the hook
     * gets the request and the response, and a rejection is handed to
     * `next(error)`, i.e. to the exception layer. Override when the framework
     * offers an earlier request hook (the Fastify adapter uses `onRequest`).
     *
     * @see {@link HttpServer.registerSecurityHook}
     */
    registerSecurityHook(hook) {
        return this.use((request, response, next) => {
            const error = hook(request, response);
            return error ? next(error) : next();
        });
    }
    /**
     * Appends a `Set-Cookie` header through {@link AbstractHttpAdapter.appendHeader},
     * so every cookie set during a request is sent, on every platform. The
     * value is percent-encoded, `path` defaults to `/` and `maxAge` is in
     * seconds (not milliseconds, unlike Express' `res.cookie()`); with
     * `signed: true`, the value is signed with the first `cookies.secret`.
     *
     * Throws a `TypeError` when the name, the value or an attribute is not
     * valid per RFC 6265 (which rules out header injection through `;`, CR or
     * LF) or when `sameSite: 'none'` or `partitioned` is set without `secure`,
     * and an `Error` when `signed` is set but no secret is configured.
     *
     * @see {@link HttpServer.setCookie}
     */
    setCookie(response, name, value, options = {}) {
        let cookieValue = value;
        if (options.signed) {
            if (!this.cookieSigner) {
                throw new Error(`Cannot sign cookie "${name}": no cookie secret is configured. ` +
                    'Pass "cookies: { secret }" to NestFactory.create().');
            }
            if (typeof value !== 'string') {
                throw new TypeError(`Invalid value for cookie "${name}": expected a string, received ${typeof value}`);
            }
            cookieValue = this.cookieSigner.sign(value);
        }
        return this.appendHeader(response, 'Set-Cookie', serializeCookie(name, cookieValue, options));
    }
    /**
     * Appends a `Set-Cookie` header that expires the cookie immediately.
     * `path` and `domain` must match the ones the cookie was set with; `maxAge`,
     * `expires` and `signed` are ignored.
     *
     * @see {@link HttpServer.clearCookie}
     */
    clearCookie(response, name, options = {}) {
        return this.appendHeader(response, 'Set-Cookie', serializeCookie(name, '', {
            ...options,
            maxAge: 0,
            expires: new Date(0),
        }));
    }
    /**
     * Sets the signer used for `signed` cookies. Called by `NestApplication`
     * with the signer it builds from the `cookies.secret` application option;
     * configure that option instead of calling this method.
     *
     * @internal
     */
    setCookieSigner(signer) {
        this.cookieSigner = signer;
    }
}
