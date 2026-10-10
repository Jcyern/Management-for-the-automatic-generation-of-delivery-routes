export declare const DEFAULT_REDACT_CENSOR = "[REDACTED]";
/**
 * Returns a copy of the value in which the properties matching the paths are
 * replaced with the censor, or the value itself when nothing matched.
 */
export type Redactor = (value: unknown) => unknown;
/**
 * Creates a function that masks properties of logged values.
 *
 * - A path without dots (`password`) matches a property with that name at any
 *   depth.
 * - A dotted path (`user.password`) matches when the last keys leading to a
 *   property are those keys, at any depth. Array indices are not keys, so
 *   `users.password` also matches `{ users: [{ password }] }`.
 * - Keys are compared case-insensitively.
 *
 * Plain objects, arrays, class instances, errors (including `cause` and
 * `AggregateError#errors`), `Map`s (string keys) and `Set`s are traversed.
 * Only the objects on the way to a redacted property are copied; the rest is
 * returned as is, and the input is never mutated. A circular reference is
 * replaced with `"[Circular]"` (so the objects on the cycle are copied too). If
 * the value can't be traversed (for example, a getter throws), the whole value
 * is replaced with the censor.
 *
 * @returns `undefined` when there is nothing to redact.
 */
export declare function createRedactor(paths: string[], censor?: string): Redactor | undefined;
