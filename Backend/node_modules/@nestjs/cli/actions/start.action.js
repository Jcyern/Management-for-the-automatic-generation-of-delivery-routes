import { red } from 'ansis';
import { spawn } from 'child_process';
import * as fs from 'fs';
import { join } from 'path';
import { getTscConfigPath } from '../lib/compiler/helpers/get-tsc-config.path.js';
import { getValueOrDefault } from '../lib/compiler/helpers/get-value-or-default.js';
import { defaultConfiguration, defaultOutDir, } from '../lib/configuration/defaults.js';
import { ERROR_PREFIX } from '../lib/ui/index.js';
import { treeKillSync as killProcessSync } from '../lib/utils/tree-kill.js';
import { assertNonArray } from '../lib/utils/type-assertions.js';
import { BuildAction } from './build.action.js';
export class StartAction extends BuildAction {
    async handle(context) {
        try {
            const configFileName = context.config;
            const configuration = await this.loader.load(configFileName);
            const appName = context.app;
            const pathToTsconfig = getTscConfigPath(configuration, context, appName);
            const isWatchEnabled = !!context.watch;
            const isWatchAssetsEnabled = !!context.watchAssets;
            const debugFlag = context.debug;
            assertNonArray(debugFlag);
            const binaryToRun = getValueOrDefault(configuration, 'exec', appName, 'exec', context, defaultConfiguration.exec);
            const { options: tsOptions } = this.tsConfigProvider.getByConfigFilename(pathToTsconfig);
            const outDir = tsOptions.outDir || defaultOutDir;
            const entryFile = getValueOrDefault(configuration, 'entryFile', appName, 'entryFile', context, defaultConfiguration.entryFile);
            const sourceRoot = getValueOrDefault(configuration, 'sourceRoot', appName, 'sourceRoot', context, defaultConfiguration.sourceRoot);
            const useShell = !!context.shell;
            const envFile = context.envFile ?? [];
            const onSuccess = this.createOnSuccessHook(entryFile, sourceRoot, debugFlag, outDir, binaryToRun, {
                shell: useShell,
                envFile,
            });
            await this.runBuild(appName ? [appName] : [], context, isWatchEnabled, isWatchAssetsEnabled, !!debugFlag, onSuccess);
        }
        catch (err) {
            if (err instanceof Error) {
                console.error(`\n${ERROR_PREFIX} ${err.message}\n`);
            }
            else {
                console.error(`\n${red(err)}\n`);
            }
            // A failed build (e.g. SWC type-check errors, which now reject instead of
            // exiting the process themselves) must not report success to the caller.
            process.exit(1);
        }
    }
    createOnSuccessHook(entryFile, sourceRoot, debugFlag, outDirName, binaryToRun, options) {
        let childProcessRef;
        let shuttingDown = false;
        process.on('exit', () => childProcessRef && killProcessSync(childProcessRef.pid));
        const signalHandler = (signal) => {
            shuttingDown = true;
            if (childProcessRef) {
                // Forward the signal to the child so async shutdown hooks
                // (onModuleDestroy, beforeApplicationShutdown, onApplicationShutdown)
                // can run to completion. The CLI parent will exit when the child
                // exits, see the child's exit handler below.
                childProcessRef.kill(signal);
            }
            else {
                process.exit();
            }
        };
        process.on('SIGINT', signalHandler);
        process.on('SIGTERM', signalHandler);
        return () => {
            if (childProcessRef) {
                childProcessRef.removeAllListeners('exit');
                childProcessRef.on('exit', () => {
                    childProcessRef = this.spawnChildProcess(entryFile, sourceRoot, debugFlag, outDirName, binaryToRun, {
                        shell: options.shell,
                        envFile: options.envFile,
                    });
                    childProcessRef.on('exit', (code) => {
                        childProcessRef = undefined;
                        // Exit explicitly when shutting down; in watch/cluster mode the
                        // file watcher keeps the event loop alive and would otherwise
                        // require a second Ctrl+C to exit.
                        if (shuttingDown) {
                            process.exit(code ?? 0);
                        }
                    });
                });
                childProcessRef.stdin?.pause?.();
                killProcessSync(childProcessRef.pid);
            }
            else {
                childProcessRef = this.spawnChildProcess(entryFile, sourceRoot, debugFlag, outDirName, binaryToRun, {
                    shell: options.shell,
                    envFile: options.envFile,
                });
                childProcessRef.on('exit', (code) => {
                    process.exitCode = code;
                    childProcessRef = undefined;
                    // Exit explicitly when shutting down; in watch/cluster mode the
                    // file watcher keeps the event loop alive and would otherwise
                    // require a second Ctrl+C to exit.
                    if (shuttingDown) {
                        process.exit(code ?? 0);
                    }
                });
            }
        };
    }
    spawnChildProcess(entryFile, sourceRoot, debug, outDirName, binaryToRun, options) {
        let outputFilePath = join(outDirName, sourceRoot, entryFile);
        if (!fs.existsSync(outputFilePath + '.js')) {
            outputFilePath = join(outDirName, entryFile);
        }
        let childProcessArgs = [];
        const argsStartIndex = process.argv.indexOf('--');
        if (argsStartIndex >= 0) {
            // Prevents the need for users to double escape strings
            // i.e. I can run the more natural
            //   nest start -- '{"foo": "bar"}'
            // instead of
            //   nest start -- '\'{"foo": "bar"}\''
            childProcessArgs = process.argv
                .slice(argsStartIndex + 1)
                .map((arg) => JSON.stringify(arg));
        }
        outputFilePath =
            outputFilePath.indexOf(' ') >= 0 ? `"${outputFilePath}"` : outputFilePath;
        const processArgs = [outputFilePath, ...childProcessArgs];
        if (debug) {
            const inspectFlag = typeof debug === 'string' ? `--inspect=${debug}` : '--inspect';
            processArgs.unshift(inspectFlag);
        }
        if (options.envFile && options.envFile.length > 0) {
            const envFileNodeArgs = options.envFile.map((envFilePath) => `--env-file=${envFilePath}`);
            processArgs.unshift(...envFileNodeArgs);
        }
        processArgs.unshift('--enable-source-maps');
        const spawnOptions = {
            stdio: 'inherit',
            shell: options.shell,
        };
        if (options.shell) {
            const command = [binaryToRun, ...processArgs].join(' ');
            return spawn(command, spawnOptions);
        }
        return spawn(binaryToRun, processArgs, spawnOptions);
    }
}
