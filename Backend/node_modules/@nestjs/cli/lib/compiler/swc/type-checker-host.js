import { red } from 'ansis';
import ora from 'ora';
import * as ts from 'typescript';
import { TsConfigProvider } from '../helpers/tsconfig-provider.js';
import { TypeScriptBinaryLoader } from '../typescript-loader.js';
import { INITIALIZING_TYPE_CHECKER, TSC_LOG_ERROR_PREFIX, TSC_NO_ERRORS_MESSAGE, } from './constants.js';
export class TypeCheckerHost {
    typescriptLoader = new TypeScriptBinaryLoader();
    tsConfigProvider = new TsConfigProvider(this.typescriptLoader);
    run(tsconfigPath, options) {
        if (!tsconfigPath) {
            throw new Error('"tsconfigPath" is required when "tsProgramRef" is not provided.');
        }
        const tsBinary = this.typescriptLoader.load();
        const spinner = ora({
            text: INITIALIZING_TYPE_CHECKER,
        });
        if (options.watch) {
            console.log();
            spinner.start();
            try {
                this.runInWatchMode(tsconfigPath, tsBinary, options);
                spinner.succeed();
            }
            catch (err) {
                spinner.fail();
                throw err;
            }
            return;
        }
        spinner.start();
        try {
            this.runOnce(tsconfigPath, tsBinary, options);
            spinner.succeed();
        }
        catch (err) {
            spinner.fail();
            throw err;
        }
    }
    runInWatchMode(tsconfigPath, tsBinary, options) {
        const { options: tsOptions } = this.tsConfigProvider.getByConfigFilename(tsconfigPath);
        let builderProgram = undefined;
        const reportWatchStatusCallback = (diagnostic) => {
            if (diagnostic.messageText !== TSC_NO_ERRORS_MESSAGE) {
                if (diagnostic.messageText?.includes('Found')) {
                    console.error(TSC_LOG_ERROR_PREFIX, red(diagnostic.messageText.toString()));
                }
                return;
            }
            if (!builderProgram) {
                return;
            }
            const tsProgram = builderProgram.getProgram().getProgram();
            options.onTypeCheck?.(tsProgram);
        };
        const host = this.createWatchCompilerHost(tsBinary, tsconfigPath, tsOptions, reportWatchStatusCallback);
        builderProgram = tsBinary.createWatchProgram(host);
        process.nextTick(() => {
            options.onProgramInit?.(builderProgram.getProgram().getProgram());
        });
    }
    runOnce(tsconfigPath, tsBinary, options) {
        const { options: tsOptions, fileNames, projectReferences, } = this.tsConfigProvider.getByConfigFilename(tsconfigPath);
        const createProgram = tsBinary.createIncrementalProgram ?? tsBinary.createProgram;
        const program = createProgram.call(ts, {
            rootNames: fileNames,
            projectReferences,
            options: tsOptions,
        });
        const programRef = program.getProgram
            ? program.getProgram()
            : program;
        const diagnostics = tsBinary.getPreEmitDiagnostics(programRef);
        if (diagnostics.length > 0) {
            const formatDiagnosticsHost = {
                getCanonicalFileName: (path) => path,
                getCurrentDirectory: tsBinary.sys.getCurrentDirectory,
                getNewLine: () => tsBinary.sys.newLine,
            };
            const formattedDiagnostics = tsBinary.formatDiagnosticsWithColorAndContext(diagnostics, formatDiagnosticsHost);
            console.log();
            console.log(formattedDiagnostics);
            throw new Error(`Found ${diagnostics.length} type error(s) during compilation.`);
        }
        options.onTypeCheck?.(programRef);
    }
    createWatchCompilerHost(tsBinary, tsConfigPath, options, reportWatchStatusCallback) {
        const origDiagnosticReporter = tsBinary.createDiagnosticReporter(tsBinary.sys, true);
        const tsOptions = {
            ...options,
            preserveWatchOutput: true,
            noEmit: true,
        };
        return tsBinary.createWatchCompilerHost(tsConfigPath, tsOptions, tsBinary.sys, undefined, origDiagnosticReporter, reportWatchStatusCallback);
    }
}
