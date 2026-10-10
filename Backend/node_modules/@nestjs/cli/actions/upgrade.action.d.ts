import { UpgradeCommandContext } from '../commands/index.js';
import { AbstractAction } from './abstract.action.js';
export declare class UpgradeAction extends AbstractAction {
    handle(context: UpgradeCommandContext): Promise<void>;
    private mapSchematicOptions;
}
