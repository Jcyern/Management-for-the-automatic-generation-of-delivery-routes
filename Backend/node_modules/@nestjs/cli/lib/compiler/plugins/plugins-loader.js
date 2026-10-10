import { createRequire } from 'module';
import { join } from 'path';
import { CLI_ERRORS } from '../../ui/index.js';
const require = createRequire(import.meta.url);
const PLUGIN_ENTRY_FILENAME = 'plugin';
export class PluginsLoader {
    load(plugins = [], extras = {}) {
        const pluginNames = plugins.map((entry) => typeof entry === 'object'
            ? entry.name
            : entry);
        const pluginRefs = this.resolvePluginReferences(pluginNames);
        const multiCompilerPlugins = {
            afterHooks: [],
            afterDeclarationsHooks: [],
            beforeHooks: [],
            readonlyVisitors: [],
        };
        pluginRefs.forEach((plugin, index) => {
            if (!plugin.before && !plugin.after && !plugin.afterDeclarations) {
                throw new Error(CLI_ERRORS.WRONG_PLUGIN(pluginNames[index]));
            }
            const options = typeof plugins[index] === 'object'
                ? plugins[index].options || {}
                : {};
            if (plugin.before) {
                multiCompilerPlugins.beforeHooks.push(plugin.before.bind(plugin.before, options));
            }
            if (plugin.after) {
                multiCompilerPlugins.afterHooks.push(plugin.after.bind(plugin.after, options));
            }
            if (plugin.afterDeclarations) {
                multiCompilerPlugins.afterDeclarationsHooks.push(plugin.afterDeclarations.bind(plugin.afterDeclarations, options));
            }
            if (plugin.ReadonlyVisitor) {
                const instance = new plugin.ReadonlyVisitor({
                    ...options,
                    ...extras,
                    readonly: true,
                });
                instance.key = pluginNames[index];
                multiCompilerPlugins.readonlyVisitors.push(instance);
            }
        });
        return multiCompilerPlugins;
    }
    resolvePluginReferences(pluginNames) {
        const nodeModulePaths = [
            join(process.cwd(), 'node_modules'),
            ...(require.resolve.paths('typescript') ?? []),
        ];
        return pluginNames.map((item) => {
            const binaryPath = this.resolvePluginPath(item, nodeModulePaths);
            try {
                return require(binaryPath);
            }
            catch (e) {
                // Resolution succeeded, so the plugin IS installed — it crashed while
                // being evaluated (e.g. its own imports are incompatible with the
                // TypeScript version it ended up resolving). Surface the real reason
                // instead of falling through to a misleading "not compatible" error.
                throw new Error(`"${item}" plugin failed to load: ${e?.message ?? e}`, { cause: e });
            }
        });
    }
    resolvePluginPath(item, nodeModulePaths) {
        try {
            return require.resolve(`${item}/${PLUGIN_ENTRY_FILENAME}`, {
                paths: nodeModulePaths,
            });
        }
        catch {
            // entry-point resolution failed, try bare module resolve
        }
        try {
            return require.resolve(item, { paths: nodeModulePaths });
        }
        catch (e) {
            throw new Error(`"${item}" plugin is not installed.`, { cause: e });
        }
    }
}
