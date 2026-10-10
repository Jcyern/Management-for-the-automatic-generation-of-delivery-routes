import { JSONFile } from '../../../utils/json-file.util.js';
import { findNestCliConfigPath, readJsonFile, readPackageJson, } from '../upgrade.utils.js';
const RSPACK_MIGRATION_URL = 'https://rspack.dev/guide/migration/webpack';
export function migrateCliConfig(report) {
    return (tree) => {
        const configPaths = [];
        const cliConfigPath = findNestCliConfigPath(tree);
        if (cliConfigPath) {
            configPaths.push(...migrateNestCliJson(tree, cliConfigPath, report));
        }
        configPaths.push(...migrateScripts(tree, report));
        if (configPaths.length > 0) {
            report.action(`Port the webpack configuration file(s) ${[...new Set(configPaths)]
                .map((path) => `"${path}"`)
                .join(', ')} to Rspack (the API is largely compatible; see ${RSPACK_MIGRATION_URL}). ` +
                'Replace "webpack" imports with "@rspack/core" and drop webpack-only plugins/loaders (e.g. "ts-loader" is not needed with Rspack\'s built-in SWC loader).');
        }
        return tree;
    };
}
function migrateNestCliJson(tree, path, report) {
    const config = readJsonFile(tree, path);
    if (!config) {
        return [];
    }
    const json = new JSONFile(tree, path);
    const configPaths = [];
    const targets = [
        {
            label: 'compilerOptions',
            jsonPath: ['compilerOptions'],
            options: config.compilerOptions,
        },
    ];
    for (const [name, project] of Object.entries(config.projects ?? {})) {
        targets.push({
            label: `projects.${name}.compilerOptions`,
            jsonPath: ['projects', name, 'compilerOptions'],
            options: project?.compilerOptions,
        });
    }
    for (const { label, jsonPath, options } of targets) {
        if (!options || typeof options !== 'object') {
            continue;
        }
        const usesWebpack = options.webpack === true;
        const webpackConfigPath = typeof options.webpackConfigPath === 'string'
            ? options.webpackConfigPath
            : undefined;
        const builder = options.builder;
        const builderType = typeof builder === 'string' ? builder : builder?.type;
        const builderConfigPath = typeof builder === 'object' ? builder?.options?.configPath : undefined;
        if (!usesWebpack &&
            webpackConfigPath === undefined &&
            options.webpack === undefined &&
            builderType !== 'webpack') {
            continue;
        }
        if (usesWebpack ||
            webpackConfigPath !== undefined ||
            builderType === 'webpack') {
            const configPath = builderConfigPath ?? webpackConfigPath;
            const newBuilder = configPath
                ? { type: 'rspack', options: { configPath } }
                : 'rspack';
            if (builderType === 'webpack' ||
                (usesWebpack && builderType === undefined) ||
                (webpackConfigPath !== undefined && builderType === undefined)) {
                json.modify([...jsonPath, 'builder'], newBuilder);
                report.change(`${path}: ${label}.builder set to ${JSON.stringify(newBuilder)} (webpack is deprecated in favour of Rspack)`);
                if (configPath) {
                    configPaths.push(configPath);
                }
            }
            else if (usesWebpack || webpackConfigPath !== undefined) {
                report.note(`${path}: ${label} already defines "builder" (${JSON.stringify(builderType)}); removed the deprecated "webpack"/"webpackConfigPath" options.`);
            }
        }
        if (options.webpack !== undefined) {
            json.remove([...jsonPath, 'webpack']);
            if (!usesWebpack) {
                report.change(`${path}: removed the deprecated "${label}.webpack: false" option`);
            }
        }
        if (webpackConfigPath !== undefined) {
            json.remove([...jsonPath, 'webpackConfigPath']);
        }
    }
    return configPaths;
}
function migrateScripts(tree, report) {
    const packageJson = readPackageJson(tree);
    const scripts = packageJson?.scripts ?? {};
    const configPaths = [];
    const json = new JSONFile(tree, '/package.json');
    for (const [name, script] of Object.entries(scripts)) {
        if (typeof script !== 'string' ||
            !/--webpack|--builder[ =]webpack|-b webpack/.test(script)) {
            continue;
        }
        let updated = script;
        updated = updated.replace(/--webpackPath(?:=|\s+)(\S+)/g, (_match, configPath) => {
            configPaths.push(configPath.replace(/^['"]|['"]$/g, ''));
            return `--rspackPath ${configPath}`;
        });
        updated = updated.replace(/--builder[ =]webpack\b|-b webpack\b/g, '--builder rspack');
        updated = updated.replace(/--webpack\b(?!Path)/g, '--builder rspack');
        if (updated !== script) {
            json.modify(['scripts', name], updated);
            report.change(`package.json: updated the "${name}" script to use Rspack ("${updated}")`);
        }
    }
    return configPaths;
}
