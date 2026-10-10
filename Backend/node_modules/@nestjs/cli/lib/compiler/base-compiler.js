import { dirname, join, normalize, relative } from 'path';
import { getValueOrDefault } from './helpers/get-value-or-default.js';
export class BaseCompiler {
    pluginsLoader;
    constructor(pluginsLoader) {
        this.pluginsLoader = pluginsLoader;
    }
    loadPlugins(configuration, tsConfigPath, appName) {
        const pluginsConfig = getValueOrDefault(configuration, 'compilerOptions.plugins', appName);
        const pathToSource = this.getPathToSource(configuration, tsConfigPath, appName);
        const plugins = this.pluginsLoader.load(pluginsConfig, { pathToSource });
        return plugins;
    }
    getPathToSource(configuration, tsConfigPath, appName) {
        const sourceRoot = getValueOrDefault(configuration, 'sourceRoot', appName, 'sourceRoot');
        const cwd = process.cwd();
        const relativeRootPath = dirname(relative(cwd, tsConfigPath));
        const pathToSource = normalize(sourceRoot).indexOf(normalize(relativeRootPath)) >= 0
            ? join(cwd, sourceRoot)
            : join(cwd, relativeRootPath, sourceRoot);
        return pathToSource;
    }
}
