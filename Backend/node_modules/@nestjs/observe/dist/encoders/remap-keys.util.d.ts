/**
 * Copies the properties a key map names onto a new object under their shortened
 * wire names, skipping anything the map does not mention.
 *
 * Every encoder does this, at every level of its payload. Written out inline it
 * indexes a precisely-typed result with a `string`, which needs an implicit
 * `any` at each assignment - twenty-nine of them across the four encoders under
 * `strict`. Centralising it puts the one unavoidable cast in a single place:
 * callers name the encoded type, and the key maps' `satisfies` clauses are what
 * prove the mapping covers every field of the source.
 */
export declare function remapKeys<TSource extends object, TEncoded>(source: TSource, keyMap: Partial<Record<keyof TSource, string>>): TEncoded;
