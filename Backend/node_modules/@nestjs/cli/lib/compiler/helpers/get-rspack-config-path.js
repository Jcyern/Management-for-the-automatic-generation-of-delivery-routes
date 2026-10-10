import { getValueOrDefault } from './get-value-or-default.js';
/**
 * Returns the path to the rspack configuration file to use for the given application.
 * CLI option `rspackPath` takes precedence over the configuration file.
 * @param configuration Configuration object.
 * @param cmdOptions Command line options.
 * @param appName Application name.
 * @returns The path to the rspack configuration file to use.
 */
export function getRspackConfigPath(configuration, cmdOptions, appName) {
    if (cmdOptions?.rspackPath) {
        return cmdOptions.rspackPath;
    }
    const builder = getValueOrDefault(configuration, 'compilerOptions.builder', appName);
    const rspackPath = typeof builder === 'object' && builder?.type === 'rspack'
        ? builder.options?.configPath
        : undefined;
    return rspackPath;
}
