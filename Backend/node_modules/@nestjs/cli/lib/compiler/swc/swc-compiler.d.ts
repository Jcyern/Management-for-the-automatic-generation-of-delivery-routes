import { Configuration } from '../../configuration/index.js';
import { AssetsManager } from '../assets-manager.js';
import { BaseCompiler } from '../base-compiler.js';
import type { TsConfigProviderOutput } from '../helpers/tsconfig-provider.js';
import { PluginsLoader } from '../plugins/plugins-loader.js';
export type SwcCompilerExtras = {
    watch: boolean;
    typeCheck: boolean;
    emitDeclarations: boolean;
    assetsManager: AssetsManager;
    tsOptions: TsConfigProviderOutput['options'];
    tsConfigExclude: string[];
    silent?: boolean;
};
export declare class SwcCompiler extends BaseCompiler {
    private readonly pluginMetadataGenerator;
    private readonly typeCheckerHost;
    constructor(pluginsLoader: PluginsLoader);
    run(configuration: Required<Configuration>, tsConfigPath: string, appName: string | undefined, extras: SwcCompilerExtras, onSuccess?: () => void): Promise<void>;
    private emitDeclarations;
    private runTypeChecker;
    private runSwc;
    private shouldLogSwcStatus;
    private loadSwcCliBinary;
    private getSwcRcFileContentIfExists;
    private deepMerge;
    private debounce;
    private watchFilesInSrcDir;
    private isIgnoredBySwc;
    private normalizeSwcIgnorePath;
    private watchFilesInOutDir;
}
