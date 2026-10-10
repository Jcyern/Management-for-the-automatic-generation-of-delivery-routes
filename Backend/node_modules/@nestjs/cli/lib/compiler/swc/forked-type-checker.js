import { ERROR_PREFIX } from '../../ui/index.js';
import { BaseCompiler } from '../base-compiler.js';
import { PluginMetadataGenerator } from '../plugins/plugin-metadata-generator.js';
import { PluginsLoader } from '../plugins/plugins-loader.js';
import { FOUND_NO_ISSUES_GENERATING_METADATA, FOUND_NO_ISSUES_METADATA_GENERATION_SKIPPED, } from './constants.js';
import { TypeCheckerHost } from './type-checker-host.js';
const [tsConfigPath, appName, sourceRoot, plugins] = process.argv.slice(2);
class ForkedTypeChecker extends BaseCompiler {
    pluginMetadataGenerator = new PluginMetadataGenerator();
    typeCheckerHost = new TypeCheckerHost();
    async run(configuration, tsConfigPath, appName, extras) {
        const { readonlyVisitors } = this.loadPlugins(configuration, tsConfigPath, appName);
        const outputDir = this.getPathToSource(configuration, tsConfigPath, appName);
        try {
            const onTypeCheckOrProgramInit = (program) => {
                if (readonlyVisitors.length > 0) {
                    console.log(FOUND_NO_ISSUES_GENERATING_METADATA);
                    this.pluginMetadataGenerator.generate({
                        outputDir,
                        visitors: readonlyVisitors,
                        tsProgramRef: program,
                    });
                }
                else {
                    console.log(FOUND_NO_ISSUES_METADATA_GENERATION_SKIPPED);
                }
            };
            this.typeCheckerHost.run(tsConfigPath, {
                watch: extras.watch,
                onTypeCheck: onTypeCheckOrProgramInit,
                onProgramInit: onTypeCheckOrProgramInit,
            });
        }
        catch (err) {
            console.error(ERROR_PREFIX, err.message);
        }
    }
}
const pluginsLoader = new PluginsLoader();
const forkedTypeChecker = new ForkedTypeChecker(pluginsLoader);
const applicationName = appName === 'undefined' ? '' : appName;
const options = {
    sourceRoot,
};
if (applicationName) {
    options.projects = {};
    options.projects[applicationName] = {
        compilerOptions: {
            plugins: JSON.parse(plugins),
        },
    };
}
else {
    options.compilerOptions = {
        plugins: JSON.parse(plugins),
    };
}
forkedTypeChecker.run(options, tsConfigPath, applicationName, { watch: true, typeCheck: true });
