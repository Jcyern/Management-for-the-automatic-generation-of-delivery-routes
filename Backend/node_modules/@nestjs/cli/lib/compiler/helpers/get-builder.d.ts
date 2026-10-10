import { Configuration } from '../../configuration/index.js';
/**
 * Returns the builder to use for the given application.
 * @param configuration Configuration object.
 * @param cmdOptions Command line options.
 * @param appName Application name.
 * @returns The builder to use.
 */
export declare function getBuilder(configuration: Required<Configuration>, cmdOptions: Record<string, any>, appName: string | undefined): {
    type: "webpack";
    options?: import("../../configuration/configuration.js").WebpackBuilderOptions;
} | {
    type: "rspack";
    options?: import("../../configuration/configuration.js").RspackBuilderOptions;
} | {
    type: "swc";
    options?: import("../../configuration/configuration.js").SwcBuilderOptions;
} | {
    type: "tsc";
    options?: import("../../configuration/configuration.js").TscBuilderOptions;
} | {
    type: import("../../configuration/configuration.js").BuilderVariant;
};
