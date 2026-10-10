import { existsSync } from 'fs';
import { createRequire } from 'module';
import { resolve } from 'path';
import { ERROR_PREFIX, INFO_PREFIX } from '../ui/index.js';
import { isEsmProject } from '../utils/is-esm-project.js';
import { BaseCompiler } from './base-compiler.js';
import { rspackDefaultsFactory } from './defaults/rspack-defaults.js';
import { getValueOrDefault } from './helpers/get-value-or-default.js';
const require = createRequire(import.meta.url);
export class RspackCompiler extends BaseCompiler {
    constructor(pluginsLoader) {
        super(pluginsLoader);
    }
    run(configuration, tsConfigPath, appName, extras, onSuccess) {
        const cwd = process.cwd();
        const configPath = resolve(cwd, tsConfigPath);
        if (!existsSync(configPath)) {
            throw new Error(`Could not find TypeScript configuration file "${tsConfigPath}".`);
        }
        const plugins = this.loadPlugins(configuration, tsConfigPath, appName);
        const pathToSource = this.getPathToSource(configuration, tsConfigPath, appName);
        const entryFile = getValueOrDefault(configuration, 'entryFile', appName, 'entryFile', extras.options);
        const entryFileRoot = getValueOrDefault(configuration, 'root', appName) || '';
        const defaultOptions = rspackDefaultsFactory(pathToSource, entryFileRoot, entryFile, extras.debug ?? false, configPath, plugins, isEsmProject(), extras.tsOptions);
        let rspack;
        try {
            rspack = require('@rspack/core');
        }
        catch {
            throw new Error('@rspack/core is not installed. To use the rspack compiler, install the required packages:\n\n' +
                '  npm install --save-dev @rspack/core webpack-node-externals tsconfig-paths-webpack-plugin\n');
        }
        let compiler;
        let watchOptions;
        let watch;
        if (Array.isArray(extras.rspackConfigFactoryOrConfig)) {
            const rspackConfigurations = extras.rspackConfigFactoryOrConfig.map((configOrFactory) => {
                const unwrappedConfig = typeof configOrFactory !== 'function'
                    ? configOrFactory
                    : configOrFactory(defaultOptions, rspack);
                return {
                    ...defaultOptions,
                    mode: extras.watchMode ? 'development' : defaultOptions.mode,
                    ...unwrappedConfig,
                };
            });
            compiler = rspack.rspack(rspackConfigurations);
            watchOptions = rspackConfigurations.map((config) => config.watchOptions || {});
            watch = rspackConfigurations.some((config) => config.watch);
        }
        else {
            const projectRspackOptions = typeof extras.rspackConfigFactoryOrConfig !== 'function'
                ? extras.rspackConfigFactoryOrConfig
                : extras.rspackConfigFactoryOrConfig(defaultOptions, rspack);
            const rspackConfiguration = {
                ...defaultOptions,
                mode: extras.watchMode ? 'development' : defaultOptions.mode,
                ...projectRspackOptions,
            };
            compiler = rspack.rspack(rspackConfiguration);
            watchOptions = rspackConfiguration.watchOptions;
            watch = rspackConfiguration.watch;
        }
        const afterCallback = this.createAfterCallback(onSuccess, extras.assetsManager, extras.watchMode ?? false, watch);
        if (extras.watchMode || watch) {
            compiler.hooks.watchRun.tapAsync('Rebuild info', (params, callback) => {
                console.log(`\n${INFO_PREFIX} Rspack is building your sources...\n`);
                callback();
            });
            compiler.watch(watchOptions || {}, afterCallback);
        }
        else {
            compiler.run(afterCallback);
        }
    }
    createAfterCallback(onSuccess, assetsManager, watchMode, watch) {
        return (err, stats) => {
            if (err && stats === undefined) {
                // Could not complete the compilation
                // The error caught is most likely thrown by underlying tasks
                console.log(err);
                return process.exit(1);
            }
            const statsOutput = stats.toString({
                chunks: false,
                colors: true,
                modules: false,
                assets: false,
            });
            if (!err && !stats.hasErrors()) {
                if (!onSuccess) {
                    // rspack ignores whatever this callback returns, so the close is
                    // handled here rather than awaited — but its rejection still has to
                    // be caught or it terminates the CLI after a successful compile.
                    assetsManager.closeWatchers().catch((error) => {
                        console.error(`${ERROR_PREFIX} Failed to close asset watchers. ` +
                            `${error instanceof Error ? error.message : String(error)}`);
                    });
                }
                else {
                    onSuccess();
                }
            }
            else if (!watchMode && !watch) {
                console.log(statsOutput);
                return process.exit(1);
            }
            console.log(statsOutput);
        };
    }
}
