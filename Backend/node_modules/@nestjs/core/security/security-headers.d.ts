import type { ContentSecurityPolicyOptions, SecurityHeadersOptions } from '@nestjs/common';
/**
 * Security headers resolved and validated from `app.useSecurityHeaders()`
 * options, written on every response by the security request hook.
 */
export interface ResolvedSecurityHeaders {
    /** Headers to set on every response, as `[name, value]` pairs. */
    readonly headers: ReadonlyArray<readonly [name: string, value: string]>;
    /** Headers to remove from every response (e.g. `X-Powered-By`). */
    readonly removeHeaders: readonly string[];
}
/**
 * Default Content-Security-Policy directives, identical to helmet 8.
 */
export declare const DEFAULT_CONTENT_SECURITY_POLICY_DIRECTIVES: Readonly<Record<string, readonly string[]>>;
export declare class SecurityHeadersConfigurationError extends Error {
    constructor(message: string);
}
/**
 * Serializes a Content-Security-Policy, validating directive names and
 * values so that user input cannot inject extra directives or policies.
 * Directive names may be camelCase (`scriptSrc`) or kebab-case.
 *
 * @returns the header value (directives separated by `;`, like helmet).
 */
export declare function serializeContentSecurityPolicy(options?: ContentSecurityPolicyOptions): string;
/**
 * Resolves `app.useSecurityHeaders()` options into the headers to set and
 * remove on every response, validating them once, at startup: unknown
 * options, values of the wrong type and invalid policies are rejected.
 *
 * Without options, the result matches helmet 8's defaults.
 */
export declare function resolveSecurityHeaders(options?: SecurityHeadersOptions): ResolvedSecurityHeaders;
