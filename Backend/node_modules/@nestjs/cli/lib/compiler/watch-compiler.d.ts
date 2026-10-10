import { Configuration } from '../configuration/index.js';
import { BaseCompiler } from './base-compiler.js';
import { TsConfigProvider } from './helpers/tsconfig-provider.js';
import { PluginsLoader } from './plugins/plugins-loader.js';
import { TypeScriptBinaryLoader } from './typescript-loader.js';
type TypescriptWatchCompilerExtras = {
    /**
     * If `undefined`, the value of 'preserveWatchOutput' option from tsconfig
     * file will be used instead.
     */
    preserveWatchOutput: boolean | undefined;
};
export declare class WatchCompiler extends BaseCompiler<TypescriptWatchCompilerExtras> {
    private readonly tsConfigProvider;
    private readonly typescriptLoader;
    constructor(pluginsLoader: PluginsLoader, tsConfigProvider: TsConfigProvider, typescriptLoader: TypeScriptBinaryLoader);
    run(configuration: Required<Configuration>, tsConfigPath: string, appName: string | undefined, extras: TypescriptWatchCompilerExtras, onSuccess?: () => void): void;
    private overrideCreateProgramFn;
    private createDiagnosticReporter;
    private createWatchStatusChanged;
}
export {};
