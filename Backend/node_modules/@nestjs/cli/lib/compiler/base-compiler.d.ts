import { Configuration } from '../configuration/index.js';
import { PluginsLoader } from './plugins/plugins-loader.js';
export declare abstract class BaseCompiler<T = Record<string, any>> {
    private readonly pluginsLoader;
    constructor(pluginsLoader: PluginsLoader);
    abstract run(configuration: Required<Configuration>, tsConfigPath: string, appName: string | undefined, extras?: T, onSuccess?: () => void): void | Promise<void>;
    protected loadPlugins(configuration: Required<Configuration>, tsConfigPath: string, appName: string | undefined): import("./plugins/plugins-loader.js").MultiNestCompilerPlugins;
    protected getPathToSource(configuration: Required<Configuration>, tsConfigPath: string, appName: string | undefined): string;
}
