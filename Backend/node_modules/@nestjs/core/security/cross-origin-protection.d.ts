import { type CsrfProtectionOptions, type HttpServer, ForbiddenException } from '@nestjs/common';
import type { RouteInfoPathExtractor } from '../middleware/route-info-path-extractor.js';
/**
 * The request facts the cross-origin decision depends on.
 */
export interface CrossOriginRequestInfo {
    /** Request method, e.g. `POST`. */
    method: string;
    /** Value of the `Sec-Fetch-Site` request header, if any. */
    secFetchSite?: string;
    /** Value of the `Origin` request header, if any. */
    origin?: string;
    /** The request authority: `:authority` on HTTP/2, `Host` otherwise. */
    host?: string;
}
export type CrossOriginAllowedReason = 'safe-method' | 'same-origin' | 'origin-matches-host' | 'no-browser-headers' | 'trusted-origin' | 'excluded';
export type CrossOriginDeniedReason = 'cross-origin-sec-fetch-site' | 'cross-origin-origin-header';
export type CrossOriginDecision = {
    allowed: true;
    reason: CrossOriginAllowedReason;
} | {
    allowed: false;
    reason: CrossOriginDeniedReason;
};
export interface CrossOriginExemptions {
    /** Normalized trusted origins (see {@link normalizeTrustedOrigin}). */
    trustedOrigins?: ReadonlySet<string>;
    /**
     * Evaluated lazily, only when the request would otherwise be rejected
     * (mirroring Go, where bypass patterns are consulted on the reject path).
     */
    isExcluded?: () => boolean;
}
/**
 * Decides whether a request may proceed, following Go's
 * `net/http.CrossOriginProtection.Check`:
 *
 * 1. `GET`, `HEAD` and `OPTIONS` are always allowed (they must not change
 *    state). Methods are compared case-sensitively, as HTTP defines them.
 * 2. When `Sec-Fetch-Site` is present, `same-origin` and `none` (a
 *    user-initiated navigation such as a bookmark) are allowed. Any other
 *    value (`same-site`, `cross-site`, or anything unexpected) is rejected
 *    unless the request is exempt.
 * 3. Without `Sec-Fetch-Site`, a request without `Origin` is allowed: it comes
 *    from a non-browser client, or from a browser that sends neither header
 *    for same-origin requests.
 * 4. Otherwise the host of `Origin` is compared with the request authority,
 *    case-insensitively, and ignoring the default port of the `Origin` scheme
 *    (`https://a.example` matches `a.example:443`). A match is allowed (the
 *    scheme is not known, so an HTTP to HTTPS request fails open, as in Go;
 *    HSTS mitigates that). A mismatch is rejected unless the request is
 *    exempt.
 *
 * A request is exempt when it matches an exclusion or when its `Origin` is
 * one of the trusted origins.
 */
export declare function evaluateCrossOriginRequest(request: CrossOriginRequestInfo, exemptions?: CrossOriginExemptions): CrossOriginDecision;
/**
 * Validates a trusted origin and returns it in the form browsers serialize
 * the `Origin` header (lower-case scheme and host, no default port). Same
 * rules as Go's `AddTrustedOrigin`: a scheme and a host are required; a path
 * (even `/`), query string, fragment or credentials are not allowed.
 * Wildcards are rejected too, as origins are matched exactly.
 */
export declare function normalizeTrustedOrigin(origin: string): string;
/**
 * Binds {@link evaluateCrossOriginRequest} to an HTTP adapter: reads the
 * request through the adapter accessors and turns a rejection into a
 * `ForbiddenException`, so exception filters shape the `403` response.
 *
 * Used by `app.enableCsrfProtection()`.
 */
export declare class CrossOriginProtection<TRequest = any> {
    private readonly httpAdapter;
    private readonly trustedOrigins;
    private readonly excludedRoutes;
    private readonly excludePredicate?;
    private resolvedExclusions;
    /**
     * Validates the options, so that a bad configuration fails as soon as
     * `app.enableCsrfProtection()` is called.
     */
    constructor(httpAdapter: HttpServer<TRequest>, options?: CsrfProtectionOptions<TRequest>);
    /**
     * Resolves the excluded routes to the paths they are served at, like
     * `MiddlewareConsumer.exclude()` does: with the global prefix (unless the
     * route is excluded from it) and, with URI versioning, the version segment
     * of `RouteInfo.version`. Called by `app.init()`, once the global prefix
     * and versioning are final; until then nothing is excluded.
     */
    resolveExclusions(pathExtractor: RouteInfoPathExtractor): void;
    /**
     * Returns a `ForbiddenException` when the request must be rejected, and
     * `undefined` otherwise.
     */
    check(request: TRequest): ForbiddenException | undefined;
    private isExcluded;
}
