/**
 * Dictionary of cookies keyed by name. Created without a prototype, so names
 * such as `__proto__` or `constructor` are stored as plain entries.
 */
export type CookieRecord = Record<string, string>;
/**
 * Parses a `Cookie` request header (RFC 6265, section 5.4) into a
 * prototype-less dictionary.
 *
 * - pairs are separated by `;`, and split on the first `=` only;
 * - names and values are trimmed, and a value wrapped in double quotes is
 *   unquoted;
 * - values are percent-decoded, falling back to the raw value when they are
 *   not valid percent-encoding;
 * - pairs without `=` or with an empty name are ignored;
 * - when a name occurs more than once, the first occurrence wins (browsers
 *   send the most specific path first).
 */
export declare function parseCookieHeader(header: string | string[] | undefined | null): CookieRecord;
