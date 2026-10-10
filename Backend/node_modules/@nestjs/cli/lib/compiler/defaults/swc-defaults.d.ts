import * as ts from 'typescript';
import { Configuration } from '../../configuration/index.js';
export declare const swcDefaultsFactory: (tsOptions?: ts.CompilerOptions, configuration?: Configuration, tsConfigExclude?: string[], appName?: string) => {
    swcOptions: {
        sourceMaps: string | boolean | undefined;
        module: {
            type: string;
            resolveFully: boolean;
        } | {
            type: string;
            resolveFully?: undefined;
        };
        jsc: {
            experimental?: {
                keepImportAttributes: boolean;
            } | undefined;
            target: string;
            parser: {
                syntax: string;
                decorators: boolean;
                dynamicImport: boolean;
            };
            transform: {
                legacyDecorator: boolean;
                decoratorMetadata: boolean;
                useDefineForClassFields: boolean;
            };
            keepClassNames: boolean;
            baseUrl: string | undefined;
            paths: ts.MapLike<string[]> | undefined;
        };
        minify: boolean;
        swcrc: boolean;
    };
    cliOptions: {
        outDir: string;
        filenames: string[];
        sync: boolean;
        extensions: string[];
        copyFiles: boolean;
        includeDotfiles: boolean;
        ignore: string[] | undefined;
        quiet: boolean;
        watch: boolean;
        stripLeadingPaths: boolean;
    } | {
        swcrcPath?: string;
        outDir: string;
        filenames: string[];
        sync: boolean;
        extensions: string[];
        copyFiles: boolean;
        includeDotfiles: boolean;
        quiet: boolean;
        ignore: string[] | undefined;
        watch: boolean;
        stripLeadingPaths: boolean;
    } | {
        configPath?: string;
        outDir: string;
        filenames: string[];
        sync: boolean;
        extensions: string[];
        copyFiles: boolean;
        includeDotfiles: boolean;
        ignore: string[] | undefined;
        quiet: boolean;
        watch: boolean;
        stripLeadingPaths: boolean;
    };
};
/**
 * Picks the module format tsc would emit for the project's `.ts` files: ES
 * modules when the package is `"type": "module"`, unless the tsconfig pins an
 * older, non-ES module kind (e.g. `"module": "commonjs"`). Projects without
 * `"type": "module"` keep CommonJS output.
 */
export declare function resolveSwcModuleType(tsOptions?: ts.CompilerOptions, esmPackage?: boolean): 'es6' | 'commonjs';
