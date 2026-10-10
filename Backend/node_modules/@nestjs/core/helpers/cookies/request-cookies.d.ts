import type { CookieSigner } from './cookie-signer.js';
import { CookieRecord } from './parse-cookie-header.js';
/**
 * Returns the request cookies. `req.cookies`, when a cookie middleware
 * (`cookie-parser`, `@fastify/cookie`) already populated it, takes precedence
 * over parsing the `Cookie` header.
 */
export declare function getRequestCookies(req: Record<string, any>): CookieRecord;
/**
 * Returns a single request cookie, or `undefined` when it was not sent. Only
 * own entries count, so names such as `constructor` never resolve to
 * inherited members of a middleware-provided `req.cookies` object.
 */
export declare function getRequestCookie(req: Record<string, any>, name: string): string | undefined;
/**
 * Returns the request cookies whose signature verifies, with their unsigned
 * value. Cookies that are not signed, or whose signature does not verify, are
 * left out.
 *
 * Without a signer (no `cookies.secret` option), falls back to
 * `req.signedCookies` as populated by `cookie-parser`, dropping the entries it
 * marked invalid (`false`). Throws when neither is available.
 */
export declare function getRequestSignedCookies(req: Record<string, any>, signer: CookieSigner | undefined): CookieRecord;
/**
 * Returns the unsigned value of a single signed cookie, or `undefined` when it
 * is missing or its signature does not verify. Same fallbacks as
 * {@link getRequestSignedCookies}.
 */
export declare function getRequestSignedCookie(req: Record<string, any>, name: string, signer: CookieSigner | undefined): string | undefined;
