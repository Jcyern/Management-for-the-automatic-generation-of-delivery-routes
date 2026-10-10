import { getDefaultTsconfigPath } from '../../utils/get-default-tsconfig-path.js';
import { getValueOrDefault } from './get-value-or-default.js';
/**
 * Returns the path to the tsc configuration file to use for the given application.
 * @param configuration Configuration object.
 * @param cmdOptions Command line options.
 * @param appName Application name.
 * @returns The path to the tsc configuration file to use.
 */
export function getTscConfigPath(configuration, cmdOptions, appName) {
    let tsconfigPath = getValueOrDefault(configuration, 'compilerOptions.tsConfigPath', appName, 'path', cmdOptions);
    if (tsconfigPath) {
        return tsconfigPath;
    }
    const builder = getValueOrDefault(configuration, 'compilerOptions.builder', appName);
    tsconfigPath =
        typeof builder === 'object' && builder?.type === 'tsc'
            ? builder.options?.configPath
            : undefined;
    return tsconfigPath ?? getDefaultTsconfigPath();
}
