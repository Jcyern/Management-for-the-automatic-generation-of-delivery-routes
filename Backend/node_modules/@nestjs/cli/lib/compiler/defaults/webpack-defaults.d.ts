import type webpack from 'webpack';
import { MultiNestCompilerPlugins } from '../plugins/plugins-loader.js';
export declare const webpackDefaultsFactory: (sourceRoot: string, relativeSourceRoot: string, entryFilename: string, isDebugEnabled: boolean | undefined, tsConfigFile: string | undefined, plugins: MultiNestCompilerPlugins) => webpack.Configuration;
