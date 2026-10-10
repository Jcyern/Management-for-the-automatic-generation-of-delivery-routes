import * as ts from 'typescript';
import { DeepPluginMeta, ReadonlyVisitor } from '../interfaces/readonly-visitor.interface.js';
/**
 * Returns the same import path with `.js` appended when (and only when)
 * the path is relative and does not already end in a recognized
 * extension. Bare specifiers (e.g. `@nestjs/common`) and absolute paths
 * are returned unchanged because the caller's resolver handles them.
 */
export declare function appendJsExtensionIfMissing(importPath: string): string;
/**
 * Rewrites a single `await import("...")`-style string by appending the
 * `.js` extension to the inner specifier when it is a relative path
 * without an extension. Used to patch the visitor-supplied `typeImports`
 * map values.
 */
export declare function rewriteAsyncImportString(target: string): string;
/**
 * Walks the given `ts.CallExpression` tree and rewrites every dynamic
 * `import("...")` whose specifier is a relative path missing an
 * extension. Returns a new node when changes are required, or the input
 * node unchanged otherwise.
 */
export declare function rewriteImportExpressionForNodeNext(expression: ts.CallExpression, tsBinary: typeof ts): ts.CallExpression;
/**
 * Recursively walks the collected plugin metadata, rewriting every
 * dynamic `import("./relative")` call expression to include the `.js`
 * extension required by node16 / nodenext module resolution.
 */
export declare function rewriteCollectedMetadataForNodeNext(metadata: Record<string, Record<string, Array<[ts.CallExpression, DeepPluginMeta]>>>, tsBinary: typeof ts): void;
export interface PluginMetadataGenerateOptions {
    /**
     * The visitors to use to generate the metadata.
     */
    visitors: ReadonlyVisitor[];
    /**
     * The output directory to write the metadata to.
     */
    outputDir: string;
    /**
     * Whether to watch the project for changes.
     */
    watch?: boolean;
    /**
     * The path to the tsconfig file.
     * Relative to the current working directory (process.cwd()).
     */
    tsconfigPath?: string;
    /**
     * The filename to write the metadata to.
     */
    filename?: string;
    /**
     * A reference to an existing ts.Program instance.
     */
    tsProgramRef?: ts.Program;
    /**
     * Whether to print diagnostics to the console.
     * @default true
     */
    printDiagnostics?: boolean;
}
/**
 * Generates plugins metadata by traversing the AST of the project.
 * @example
 * ```ts
 * const generator = new PluginMetadataGenerator();
 * generator.generate({
 *  visitors: [
 *    new ReadonlyVisitor({ introspectComments: true, pathToSource: __dirname }),
 *  ],
 *  outputDir: __dirname,
 *  watch: true,
 *  tsconfigPath: 'tsconfig.build.json',
 * });
 * ```
 */
export declare class PluginMetadataGenerator {
    private readonly pluginMetadataPrinter;
    private readonly typeCheckerHost;
    private readonly typescriptLoader;
    private readonly tsBinary;
    constructor();
    generate(options: PluginMetadataGenerateOptions): void;
    private traverseAndPrintMetadata;
}
