import { DeployCommandContext } from '../commands/index.js';
import { AbstractAction } from './abstract.action.js';
export declare class DeployAction extends AbstractAction {
    handle(context: DeployCommandContext): Promise<void>;
    private installMau;
}
