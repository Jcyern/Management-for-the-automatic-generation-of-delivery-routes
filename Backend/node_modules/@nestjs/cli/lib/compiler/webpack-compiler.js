import { existsSync } from 'fs';
import { createRequire } from 'module';
import { resolve } from 'path';
import { ERROR_PREFIX, INFO_PREFIX } from '../ui/index.js';
import { isEsmProject } from '../utils/is-esm-project.js';
import { BaseCompiler } from './base-compiler.js';
import { webpackDefaultsFactory } from './defaults/webpack-defaults.js';
import { getValueOrDefault } from './helpers/get-value-or-default.js';
const WEBPACK_DEPRECATION_MSG = 'The webpack compiler is deprecated and will be removed in a future major version. ' +
    'Please migrate to rspack (--builder rspack). ' +
    'See https://docs.nestjs.com/cli/usages#build for details.';
const require = createRequire(import.meta.url);
function loadWebpack() {
    try {
        return require('webpack');
    }
    catch {
        throw new Error('webpack is not installed. To use the webpack compiler, install the required packages:\n\n' +
            '  npm install --save-dev webpack webpack-node-externals tsconfig-paths-webpack-plugin ts-loader\n');
    }
}
export class WebpackCompiler extends BaseCompiler {
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
        if (isEsmProject()) {
            throw new Error('The webpack compiler does not support ESM projects ("type": "module" in package.json). ' +
                'Please use rspack instead by setting "builder": "rspack" in your nest-cli.json compilerOptions, ' +
                'or use --builder rspack on the command line.');
        }
        console.warn(`\n${INFO_PREFIX} ${WEBPACK_DEPRECATION_MSG}\n`);
        const defaultOptions = webpackDefaultsFactory(pathToSource, entryFileRoot, entryFile, extras.debug ?? false, configPath, plugins);
        const wp = loadWebpack();
        let compiler;
        let watchOptions;
        let watch;
        if (Array.isArray(extras.webpackConfigFactoryOrConfig)) {
            const webpackConfigurations = extras.webpackConfigFactoryOrConfig.map((configOrFactory) => {
                const unwrappedConfig = typeof configOrFactory !== 'function'
                    ? configOrFactory
                    : configOrFactory(defaultOptions, wp);
                return {
                    ...defaultOptions,
                    mode: extras.watchMode ? 'development' : defaultOptions.mode,
                    ...unwrappedConfig,
                };
            });
            compiler = wp(webpackConfigurations);
            watchOptions = webpackConfigurations.map((config) => config.watchOptions || {});
            watch = webpackConfigurations.some((config) => config.watch);
        }
        else {
            const projectWebpackOptions = typeof extras.webpackConfigFactoryOrConfig !== 'function'
                ? extras.webpackConfigFactoryOrConfig
                : extras.webpackConfigFactoryOrConfig(defaultOptions, wp);
            const webpackConfiguration = {
                ...defaultOptions,
                mode: extras.watchMode ? 'development' : defaultOptions.mode,
                ...projectWebpackOptions,
            };
            compiler = wp(webpackConfiguration);
            watchOptions = webpackConfiguration.watchOptions;
            watch = webpackConfiguration.watch;
        }
        const afterCallback = this.createAfterCallback(onSuccess, extras.assetsManager, extras.watchMode ?? false, watch);
        if (extras.watchMode || watch) {
            compiler.hooks.watchRun.tapAsync('Rebuild info', (params, callback) => {
                console.log(`\n${INFO_PREFIX} Webpack is building your sources...\n`);
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
                    // webpack ignores whatever this callback returns, so the close is
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
