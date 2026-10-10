import { CLI_ERRORS } from '../ui/errors.js';
import { BaseCompiler } from './base-compiler.js';
import { getValueOrDefault } from './helpers/get-value-or-default.js';
import { displayManualRestartTip, listenForManualRestart, } from './helpers/manual-restart.js';
import { tsconfigPathsBeforeHookFactory } from './hooks/tsconfig-paths.hook.js';
export class WatchCompiler extends BaseCompiler {
    tsConfigProvider;
    typescriptLoader;
    constructor(pluginsLoader, tsConfigProvider, typescriptLoader) {
        super(pluginsLoader);
        this.tsConfigProvider = tsConfigProvider;
        this.typescriptLoader = typescriptLoader;
    }
    run(configuration, tsConfigPath, appName, extras, onSuccess) {
        const tsBin = this.typescriptLoader.load();
        const configPath = tsBin.findConfigFile(process.cwd(), tsBin.sys.fileExists, tsConfigPath);
        if (!configPath) {
            throw new Error(CLI_ERRORS.MISSING_TYPESCRIPT(tsConfigPath));
        }
        const { options, projectReferences } = this.tsConfigProvider.getByConfigFilename(tsConfigPath);
        const createProgram = tsBin.createEmitAndSemanticDiagnosticsBuilderProgram;
        const origDiagnosticReporter = tsBin.createDiagnosticReporter(tsBin.sys, true);
        const origWatchStatusReporter = tsBin.createWatchStatusReporter(tsBin.sys, true);
        const host = tsBin.createWatchCompilerHost(configPath, {
            ...options,
            preserveWatchOutput: extras.preserveWatchOutput ?? options.preserveWatchOutput,
        }, tsBin.sys, createProgram, this.createDiagnosticReporter(origDiagnosticReporter), this.createWatchStatusChanged(origWatchStatusReporter, onSuccess));
        const manualRestart = getValueOrDefault(configuration, 'compilerOptions.manualRestart', appName);
        const plugins = this.loadPlugins(configuration, tsConfigPath, appName);
        this.overrideCreateProgramFn(host, manualRestart, projectReferences, plugins);
        const watchProgram = tsBin.createWatchProgram(host);
        if (manualRestart) {
            listenForManualRestart(() => {
                watchProgram.close();
                this.run(configuration, tsConfigPath, appName, extras, onSuccess);
            });
        }
    }
    overrideCreateProgramFn(host, manualRestart, projectReferences, plugins) {
        const origCreateProgram = host.createProgram;
        host.createProgram = (rootNames, options, host, oldProgram) => {
            if (manualRestart) {
                displayManualRestartTip();
            }
            const tsconfigPathsPlugin = options
                ? tsconfigPathsBeforeHookFactory(options)
                : null;
            const program = origCreateProgram(rootNames, options, host, oldProgram, undefined, projectReferences);
            const origProgramEmit = program.emit;
            program.emit = (targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers) => {
                let transforms = customTransformers;
                transforms = typeof transforms !== 'object' ? {} : transforms;
                const before = plugins.beforeHooks.map((hook) => hook(program.getProgram()));
                const after = plugins.afterHooks.map((hook) => hook(program.getProgram()));
                const afterDeclarations = plugins.afterDeclarationsHooks.map((hook) => hook(program.getProgram()));
                if (tsconfigPathsPlugin) {
                    before.unshift(tsconfigPathsPlugin);
                    afterDeclarations.unshift(tsconfigPathsPlugin);
                }
                transforms.before = before.concat(transforms.before || []);
                transforms.after = after.concat(transforms.after || []);
                transforms.afterDeclarations = afterDeclarations.concat(transforms.afterDeclarations || []);
                return origProgramEmit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, transforms);
            };
            return program;
        };
    }
    createDiagnosticReporter(diagnosticReporter) {
        return function (diagnostic, ...args) {
            return diagnosticReporter.call(this, diagnostic, ...args);
        };
    }
    createWatchStatusChanged(watchStatusReporter, onSuccess) {
        return function (diagnostic, ...args) {
            const messageText = diagnostic && diagnostic.messageText;
            const noErrorsMessage = '0 errors';
            if (messageText &&
                messageText.includes &&
                messageText.includes(noErrorsMessage) &&
                onSuccess) {
                onSuccess();
            }
            return watchStatusReporter.call(this, diagnostic, ...args);
        };
    }
}
