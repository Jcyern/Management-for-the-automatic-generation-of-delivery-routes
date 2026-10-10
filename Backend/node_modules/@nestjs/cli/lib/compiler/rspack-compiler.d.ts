import type * as ts from 'typescript';
import { Configuration } from '../configuration/index.js';
import { AssetsManager } from './assets-manager.js';
import { BaseCompiler } from './base-compiler.js';
import { PluginsLoader } from './plugins/plugins-loader.js';
export type RspackConfigFactory = (config: Record<string, any>, rspackRef: any) => Record<string, any>;
export type RspackConfigFactoryOrConfig = RspackConfigFactory | Record<string, any>;
export type RspackCompilerExtras = {
    options: Record<string, any>;
    assetsManager: AssetsManager;
    rspackConfigFactoryOrConfig: RspackConfigFactoryOrConfig | RspackConfigFactoryOrConfig[];
    debug?: boolean;
    watchMode?: boolean;
    tsOptions?: ts.CompilerOptions;
};
export declare class RspackCompiler extends BaseCompiler<RspackCompilerExtras> {
    constructor(pluginsLoader: PluginsLoader);
    run(configuration: Required<Configuration>, tsConfigPath: string, appName: string | undefined, extras: RspackCompilerExtras, onSuccess?: () => void): void;
    private createAfterCallback;
}
