export function assertNonArray(value) {
    if (Array.isArray(value)) {
        throw new TypeError('Expected a non-array value');
    }
}
