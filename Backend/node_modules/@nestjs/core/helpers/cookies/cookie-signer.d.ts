/**
 * Prefix that marks a signed cookie value, as written by Express'
 * `res.cookie(name, value, { signed: true })` and read by `cookie-parser`.
 */
export declare const SIGNED_COOKIE_PREFIX = "s:";
/**
 * Signs and verifies cookie values with HMAC-SHA256.
 *
 * The format is the one of the `cookie-signature` package (used by
 * `cookie-parser` and `express-session`): `value.signature`, where the
 * signature is the base64 digest without `=` padding. Signed values carry the
 * `s:` prefix, so cookies signed by `cookie-parser`/Express with the same
 * secret keep verifying, and so do un-prefixed values signed by
 * `@fastify/cookie`.
 *
 * With several secrets, values are signed with the first one and verified
 * against each of them (secret rotation).
 */
export declare class CookieSigner {
    private readonly secrets;
    constructor(secret: string | string[]);
    /**
     * Returns `s:<value>.<signature>`, signed with the first secret.
     */
    sign(value: string): string;
    /**
     * Returns the original value when `input` carries a valid signature for
     * any of the secrets, `undefined` otherwise. The `s:` prefix is optional.
     */
    unsign(input: string): string | undefined;
    private digest;
}
