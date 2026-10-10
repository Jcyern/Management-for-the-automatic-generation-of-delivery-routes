import type { CookieSerializeOptions } from '@nestjs/common';
/**
 * Builds the value of a `Set-Cookie` response header (RFC 6265, section 4.1).
 *
 * The value is percent-encoded with `encodeURIComponent()`, whose output only
 * contains RFC 6265 `cookie-octet`s. `path` defaults to `/`. Throws a
 * `TypeError` when the name, the value or an attribute would produce an
 * invalid header or smuggle extra attributes (`;`, CR, LF, ...), and when
 * `sameSite: 'none'` or `partitioned` is set without `secure`, since browsers
 * reject such cookies.
 *
 * Signing is not handled here: pass an already signed value.
 */
export declare function serializeCookie(name: string, value: string, options?: CookieSerializeOptions): string;
