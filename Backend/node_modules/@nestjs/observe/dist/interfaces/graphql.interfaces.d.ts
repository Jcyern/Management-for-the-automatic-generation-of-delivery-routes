/**
 * The part of `graphql`'s `GraphQLResolveInfo` this module reads.
 *
 * Declared structurally rather than imported: `@nestjs/graphql` and `graphql`
 * are optional peers, and importing a type from them here would make every
 * service that never touches GraphQL fail to compile without them installed.
 * Anything the real `GraphQLResolveInfo` provides is assignable to this.
 *
 * The instance handed to the `graphql` options is synthesised from the incoming
 * document rather than taken from a resolver - operations are measured whole,
 * so there is no single field being resolved when they are called - but it
 * carries the values a root field's real info carried.
 */
export interface GraphQLResolveInfoLike {
    /** The field being resolved, e.g. `orders`. */
    fieldName: string;
    /** The type the field hangs off - `Query`, `Mutation` or `Subscription`. */
    parentType: {
        name: string;
    };
    /** The document's operation, when the request carried one. */
    operation?: {
        operation?: string;
        name?: {
            value?: string;
        };
    };
}
