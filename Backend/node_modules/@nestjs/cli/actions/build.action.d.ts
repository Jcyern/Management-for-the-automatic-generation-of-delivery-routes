import { AssetsManager } from '../lib/compiler/assets-manager.js';
import { TsConfigProvider } from '../lib/compiler/helpers/tsconfig-provider.js';
import { PluginsLoader } from '../lib/compiler/plugins/plugins-loader.js';
import { TypeScriptBinaryLoader } from '../lib/compiler/typescript-loader.js';
import { ConfigurationLoader } from '../lib/configuration/index.js';
import { FileSystemReader } from '../lib/readers/index.js';
import { AbstractAction } from './abstract.action.js';
export declare class BuildAction extends AbstractAction {
    protected readonly pluginsLoader: PluginsLoader;
    protected readonly tsLoader: TypeScriptBinaryLoader;
    protected readonly tsConfigProvider: TsConfigProvider;
    protected readonly fileSystemReader: FileSystemReader;
    protected readonly loader: ConfigurationLoader;
    /**
     * Each app build owns its assets manager: `closeWatchers()` closes every
     * watcher it holds, so a manager shared across a `--parallel` run would let
     * the first app to finish tear down the watchers of apps still building.
     */
    protected createAssetsManager(): AssetsManager;
    handle(context: any): Promise<void>;
    runBuild(apps: (string | undefined)[], options: Record<string, any>, watchMode: boolean, watchAssetsMode: boolean, isDebugEnabled?: boolean, onSuccess?: () => void): Promise<void>;
    private runSwc;
    private runWebpack;
    private runTsc;
    private getWebpackConfigFactoryByPath;
    private runRspack;
    private getRspackConfigFactoryByPath;
    private warnOnIgnoredLibraryAssets;
}
