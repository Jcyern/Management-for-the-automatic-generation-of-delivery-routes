import { StartCommandContext } from '../commands/index.js';
import { BuildAction } from './build.action.js';
export declare class StartAction extends BuildAction {
    handle(context: StartCommandContext): Promise<void>;
    private createOnSuccessHook;
    private spawnChildProcess;
}
