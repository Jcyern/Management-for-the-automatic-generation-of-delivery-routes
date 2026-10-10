import { cyan } from 'ansis';
import { fork, spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { stat } from 'fs/promises';
import { parse as parseJsonc, printParseErrorCode, } from 'jsonc-parser';
import { minimatch } from 'minimatch';
import { createRequire } from 'module';
import * as path from 'path';
import { dirname, isAbsolute, join, posix, relative } from 'path';
import { fileURLToPath } from 'url';
import { ERROR_PREFIX } from '../../ui/index.js';
import { treeKillSync } from '../../utils/tree-kill.js';
import { BaseCompiler } from '../base-compiler.js';
import { swcDefaultsFactory } from '../defaults/swc-defaults.js';
import { getValueOrDefault } from '../helpers/get-value-or-default.js';
import { PluginMetadataGenerator } from '../plugins/plugin-metadata-generator.js';
import { watchDirectoryRecursively } from '../watchers/recursive-directory-watcher.js';
import { FOUND_NO_ISSUES_GENERATING_METADATA, FOUND_NO_ISSUES_METADATA_GENERATION_SKIPPED, SWC_LOG_PREFIX, } from './constants.js';
import { TypeCheckerHost } from './type-checker-host.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
export class SwcCompiler extends BaseCompiler {
    pluginMetadataGenerator = new PluginMetadataGenerator();
    typeCheckerHost = new TypeCheckerHost();
    constructor(pluginsLoader) {
        super(pluginsLoader);
    }
    async run(configuration, tsConfigPath, appName, extras, onSuccess) {
        const swcOptions = swcDefaultsFactory(extras.tsOptions, configuration, extras.tsConfigExclude, appName);
        const swcrcFilePath = getValueOrDefault(configuration, 'compilerOptions.builder.options.swcrcPath', appName);
        if (extras.watch) {
            if (extras.typeCheck) {
                this.runTypeChecker(configuration, tsConfigPath, appName, extras);
            }
            await this.runSwc(swcOptions, extras, swcrcFilePath);
            if (extras.emitDeclarations) {
                this.emitDeclarations(tsConfigPath);
            }
            if (onSuccess) {
                onSuccess();
                const debounceTime = 150;
                const callback = this.debounce(onSuccess, debounceTime);
                void this.watchFilesInOutDir(swcOptions, callback);
            }
        }
        else {
            if (extras.typeCheck) {
                await this.runTypeChecker(configuration, tsConfigPath, appName, extras);
            }
            await this.runSwc(swcOptions, extras, swcrcFilePath);
            if (extras.emitDeclarations) {
                this.emitDeclarations(tsConfigPath);
            }
            if (onSuccess) {
                onSuccess();
            }
            await extras.assetsManager?.closeWatchers();
        }
    }
    emitDeclarations(tsConfigPath) {
        process.nextTick(() => console.log(SWC_LOG_PREFIX, cyan('Emitting declaration files...')));
        const tscPath = join(process.cwd(), 'node_modules', '.bin', 'tsc');
        const result = spawnSync(tscPath, ['--emitDeclarationOnly', '-p', tsConfigPath], {
            cwd: process.cwd(),
            stdio: 'inherit',
            shell: true,
        });
        if (result.status !== 0) {
            console.error(ERROR_PREFIX +
                ' Failed to emit declaration files. Please ensure "declaration" is enabled in your tsconfig.');
        }
    }
    runTypeChecker(configuration, tsConfigPath, appName, extras) {
        if (extras.watch) {
            const args = [
                tsConfigPath,
                appName ?? 'undefined',
                // The forked checker resolves its plugin metadata output directory
                // from this value, so it has to be the built application's source
                // root, not the monorepo's default project one.
                getValueOrDefault(configuration, 'sourceRoot', appName, 'sourceRoot') ?? 'src',
                // Same for the plugins: a monorepo application can declare its own
                // "compilerOptions.plugins", and the non-watch path loads them per
                // application through loadPlugins().
                JSON.stringify(getValueOrDefault(configuration, 'compilerOptions.plugins', appName) ?? []),
            ];
            const childProcessRef = fork(join(__dirname, 'forked-type-checker.js'), args, {
                cwd: process.cwd(),
            });
            process.on('exit', () => childProcessRef && treeKillSync(childProcessRef.pid));
        }
        else {
            const { readonlyVisitors } = this.loadPlugins(configuration, tsConfigPath, appName);
            const outputDir = this.getPathToSource(configuration, tsConfigPath, appName);
            let fulfilled = false;
            return new Promise((resolve, reject) => {
                try {
                    this.typeCheckerHost.run(tsConfigPath, {
                        watch: extras.watch,
                        onTypeCheck: (program) => {
                            if (!fulfilled) {
                                fulfilled = true;
                                resolve();
                            }
                            if (readonlyVisitors.length > 0) {
                                process.nextTick(() => console.log(FOUND_NO_ISSUES_GENERATING_METADATA));
                                this.pluginMetadataGenerator.generate({
                                    outputDir,
                                    visitors: readonlyVisitors,
                                    tsProgramRef: program,
                                });
                            }
                            else {
                                process.nextTick(() => console.log(FOUND_NO_ISSUES_METADATA_GENERATION_SKIPPED));
                            }
                        },
                    });
                }
                catch (err) {
                    if (!fulfilled) {
                        fulfilled = true;
                        reject(err);
                    }
                }
            });
        }
    }
    async runSwc(options, extras, swcrcFilePath) {
        if (this.shouldLogSwcStatus(extras)) {
            process.nextTick(() => console.log(SWC_LOG_PREFIX, cyan('Running...')));
        }
        const swcCli = this.loadSwcCliBinary();
        const swcRcFile = await this.getSwcRcFileContentIfExists(swcrcFilePath);
        const swcOptions = this.deepMerge(options.swcOptions, swcRcFile);
        if (swcOptions?.jsc?.baseUrl && !isAbsolute(swcOptions?.jsc?.baseUrl)) {
            // jsc.baseUrl should be resolved by the caller, if it's passed as an object.
            // https://github.com/swc-project/swc/pull/7827
            const rootDir = process.cwd();
            swcOptions.jsc.baseUrl = path.join(rootDir, swcOptions.jsc.baseUrl);
        }
        const swcCliOpts = {
            ...options,
            swcOptions,
            cliOptions: {
                ...options.cliOptions,
                watch: extras.watch,
            },
        };
        if (extras.watch) {
            // This is required since SWC no longer supports auto-compiling of newly added files in watch mode.
            // We need to watch the source directory and trigger SWC compilation manually.
            await this.watchFilesInSrcDir(options, async (file) => {
                // Transpile newly added file (one-shot: inheriting "watch" here would
                // register one more permanent @swc/cli watcher per added file, and each
                // async invocation constructs a Piscina pool that is never destroyed)
                try {
                    await swcCli.default({
                        ...swcCliOpts,
                        cliOptions: {
                            ...swcCliOpts.cliOptions,
                            filenames: [file],
                            watch: false,
                            sync: true,
                        },
                    });
                }
                catch {
                    // Outside of watch mode "@swc/cli" rejects when a file fails to
                    // compile, after having reported the failure itself. Swallow it so
                    // that adding a file that does not compile yet does not tear down
                    // the watch process.
                }
            });
        }
        await swcCli.default(swcCliOpts);
    }
    shouldLogSwcStatus(extras) {
        if (extras.silent) {
            return false;
        }
        const npmLogLevel = process.env.npm_config_loglevel?.toLowerCase();
        return npmLogLevel !== 'silent';
    }
    loadSwcCliBinary() {
        try {
            return require('@swc/cli/lib/swc/dir');
        }
        catch {
            console.error(ERROR_PREFIX +
                ' Failed to load "@swc/cli" and/or "@swc/core" required packages. Please, make sure to install them as development dependencies.');
            process.exit(1);
        }
    }
    getSwcRcFileContentIfExists(swcrcFilePath) {
        const isCustomPath = swcrcFilePath !== undefined;
        const resolvedPath = join(process.cwd(), swcrcFilePath ?? '.swcrc');
        let content;
        try {
            content = readFileSync(resolvedPath, 'utf8');
        }
        catch (err) {
            // Only treat ENOENT on the default `.swcrc` as "no user overrides to
            // merge". Any other read error (EACCES, EISDIR, …) or a missing
            // user-specified `swcrcPath` is a fatal misconfiguration.
            const isMissing = err?.code === 'ENOENT';
            if (isCustomPath || !isMissing) {
                console.error(ERROR_PREFIX +
                    ` Failed to load "${swcrcFilePath ?? '.swcrc'}". Please, check if the file exists and is readable.`);
                process.exit(1);
            }
            return {};
        }
        // SWC strips a leading UTF-8 BOM before parsing
        // (`s.trim_start_matches('\u{feff}')`), so match that here — otherwise
        // `jsonc-parser` fails with `InvalidSymbol` on files SWC accepts.
        const stripped = content.replace(/^﻿/, '');
        // .swcrc is JSON-with-comments in SWC itself, which uses jsonc_parser
        // with `allow_comments` + `allow_trailing_commas` enabled (see swc's
        // `parse_swcrc` in crates/swc/src/lib.rs). Match that here so we don't
        // silently reject a valid `.swcrc` that carries `//` / `/* */` comments
        // or a trailing comma.
        const errors = [];
        const parsed = parseJsonc(stripped, errors, { allowTrailingComma: true });
        if (errors.length > 0) {
            const first = errors[0];
            const before = stripped.slice(0, first.offset).split('\n');
            const position = `${before.length}:${before[before.length - 1].length + 1}`;
            console.error(ERROR_PREFIX +
                ` Failed to parse "${swcrcFilePath ?? '.swcrc'}": ` +
                `${printParseErrorCode(first.error)} at ${position}. ` +
                `The file must be valid JSON with comments (JSONC).`);
            process.exit(1);
        }
        return parsed ?? {};
    }
    deepMerge(target, source) {
        if (typeof target !== 'object' ||
            target === null ||
            typeof source !== 'object' ||
            source === null) {
            return source;
        }
        if (Array.isArray(target) && Array.isArray(source)) {
            return source.reduce((acc, value, index) => {
                acc[index] = this.deepMerge(target[index], value);
                return acc;
            }, target);
        }
        const merged = { ...target };
        for (const key in source) {
            if (Object.hasOwn(source, key)) {
                if (key in target) {
                    merged[key] = this.deepMerge(target[key], source[key]);
                }
                else {
                    merged[key] = source[key];
                }
            }
        }
        return merged;
    }
    debounce(callback, wait) {
        let timeout;
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(callback, wait);
        };
    }
    async watchFilesInSrcDir(options, onFileAdded) {
        const srcDir = options.cliOptions?.filenames?.[0];
        const isDirectory = await stat(srcDir)
            .then((stats) => stats.isDirectory())
            .catch(() => false);
        if (!srcDir || !isDirectory) {
            // Skip watching if source directory is not a default "src" folder
            // or any other specified directory
            return;
        }
        const extensions = options.cliOptions?.extensions ?? ['.ts'];
        await watchDirectoryRecursively(srcDir, {
            extensions,
            onAdd: async (file) => {
                if (this.isIgnoredBySwc(file, options.cliOptions?.ignore)) {
                    return;
                }
                await onFileAdded(file);
            },
        });
    }
    isIgnoredBySwc(file, ignore = [], cwd = process.cwd()) {
        if (!ignore.length) {
            return false;
        }
        const relativeFile = isAbsolute(file) ? relative(cwd, file) : file;
        const normalizedFile = this.normalizeSwcIgnorePath(relativeFile);
        return ignore.some((pattern) => {
            const normalizedPattern = this.normalizeSwcIgnorePath(pattern);
            return [normalizedPattern, posix.join(normalizedPattern, '**')].some((pattern) => minimatch(normalizedFile, pattern));
        });
    }
    normalizeSwcIgnorePath(value) {
        return posix.normalize(value.replace(/\\/g, '/'));
    }
    async watchFilesInOutDir(options, onChange) {
        const dir = isAbsolute(options.cliOptions.outDir)
            ? options.cliOptions.outDir
            : join(process.cwd(), options.cliOptions.outDir);
        await watchDirectoryRecursively(dir, {
            extensions: ['.js', '.mjs'],
            onAdd: onChange,
            onChange: onChange,
        });
    }
}
