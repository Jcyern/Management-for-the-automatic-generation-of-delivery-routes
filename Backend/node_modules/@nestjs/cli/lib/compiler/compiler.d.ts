import { Configuration } from '../configuration/index.js';
import { BaseCompiler } from './base-compiler.js';
import { TsConfigProvider } from './helpers/tsconfig-provider.js';
import { PluginsLoader } from './plugins/plugins-loader.js';
import { TypeScriptBinaryLoader } from './typescript-loader.js';
export declare class Compiler extends BaseCompiler {
    private readonly tsConfigProvider;
    private readonly typescriptLoader;
    constructor(pluginsLoader: PluginsLoader, tsConfigProvider: TsConfigProvider, typescriptLoader: TypeScriptBinaryLoader);
    run(configuration: Required<Configuration>, tsConfigPath: string, appName: string | undefined, _extras: unknown, onSuccess?: () => void): void;
    private reportAfterCompilationDiagnostic;
}
