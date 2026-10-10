import { Configuration } from '../../configuration/index.js';
/**
 * Returns the path to the rspack configuration file to use for the given application.
 * CLI option `rspackPath` takes precedence over the configuration file.
 * @param configuration Configuration object.
 * @param cmdOptions Command line options.
 * @param appName Application name.
 * @returns The path to the rspack configuration file to use.
 */
export declare function getRspackConfigPath(configuration: Required<Configuration>, cmdOptions: Record<string, any>, appName: string | undefined): string | undefined;
