import { Configuration } from '../configuration/index.js';
export declare class AssetsManager {
    private watchAssetsKeyValue;
    private watchers;
    private watcherReadyPromises;
    /**
     * Using on `nest build` to close file watch or the build process will not end.
     * Waits for all watchers to complete their initial scan before closing them,
     * ensuring all assets are copied regardless of system speed.
     *
     * Returns a Promise that resolves once every watcher has been closed.
     * Callers (e.g. `build.action.ts`, `swc-compiler.ts`) `await` this method,
     * so it must surface the underlying close work — otherwise `await` resolves
     * immediately while file watchers stay open and the build process can race
     * its own exit, leaving handles dangling.
     */
    closeWatchers(): Promise<void>;
    copyAssets(configuration: Required<Configuration>, appName: string | undefined, outDir: string, watchAssetsMode: boolean, onSuccess?: () => void, rootDir?: string): void;
    private collectLibraryAssets;
    /**
     * Runs `actionOnFile` from a watcher callback. A rejected destination must not
     * escalate into an uncaught exception: chokidar emits synchronously, so a
     * throw here would tear down the whole watch session.
     */
    private safeActionOnFile;
    private actionOnFile;
}
