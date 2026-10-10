/**
 * Strips dangerous prototype pollution keys (__proto__, prototype, constructor)
 * from an object recursively.
 */
export declare function stripProtoKeys(value: any): void;
