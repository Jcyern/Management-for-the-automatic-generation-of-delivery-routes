import { RouteInfoPathExtractor } from '../middleware/route-info-path-extractor.js';
/**
 * The one request hook behind `app.useSecurityHeaders()` and
 * `app.enableCsrfProtection()`, installed through
 * `HttpServer.registerSecurityHook()` the first time either feature is
 * enabled.
 *
 * Composing both features here fixes their order, whichever method is called
 * first: the headers are written before the CSRF check may reject the
 * request, so a `403` carries them too.
 */
export class HttpSecurityHook {
    headers;
    crossOriginProtection;
    setHeaders(headers) {
        this.headers = headers;
    }
    setCrossOriginProtection(protection) {
        this.crossOriginProtection = protection;
    }
    /**
     * Called by `app.init()`, once the global prefix and versioning are final.
     */
    init(config) {
        this.crossOriginProtection?.resolveExclusions(new RouteInfoPathExtractor(config));
    }
    /**
     * Runs the enabled features for one request. Returns the error to hand to
     * the exception layer when the request must be rejected.
     */
    handle(request, response) {
        if (this.headers) {
            for (const [name, value] of this.headers.headers) {
                response.setHeader(name, value);
            }
            for (const name of this.headers.removeHeaders) {
                response.removeHeader(name);
            }
        }
        return this.crossOriginProtection?.check(request);
    }
}
