import { Configuration } from '../../configuration/index.js';
/**
 * Returns the path to the webpack configuration file to use for the given application.
 * @param configuration Configuration object.
 * @param cmdOptions Command line options.
 * @param appName Application name.
 * @returns The path to the webpack configuration file to use.
 */
export declare function getWebpackConfigPath(configuration: Required<Configuration>, cmdOptions: Record<string, any>, appName: string | undefined): string | undefined;
