import type * as ts from 'typescript';
import { MultiNestCompilerPlugins } from '../plugins/plugins-loader.js';
export declare const rspackDefaultsFactory: (sourceRoot: string, relativeSourceRoot: string, entryFilename: string, isDebugEnabled: boolean | undefined, tsConfigFile: string | undefined, plugins: MultiNestCompilerPlugins, isEsm?: boolean, tsOptions?: ts.CompilerOptions) => Record<string, any>;
