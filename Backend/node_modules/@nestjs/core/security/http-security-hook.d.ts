import type { SecurityRequestHook } from '@nestjs/common/internal';
import type { ApplicationConfig } from '../application-config.js';
import type { CrossOriginProtection } from './cross-origin-protection.js';
import type { ResolvedSecurityHeaders } from './security-headers.js';
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
export declare class HttpSecurityHook<TRequest = any> {
    private headers?;
    private crossOriginProtection?;
    setHeaders(headers: ResolvedSecurityHeaders): void;
    setCrossOriginProtection(protection: CrossOriginProtection<TRequest>): void;
    /**
     * Called by `app.init()`, once the global prefix and versioning are final.
     */
    init(config: ApplicationConfig): void;
    /**
     * Runs the enabled features for one request. Returns the error to hand to
     * the exception layer when the request must be rejected.
     */
    handle(request: TRequest, response: Parameters<SecurityRequestHook>[1]): Error | undefined;
}
