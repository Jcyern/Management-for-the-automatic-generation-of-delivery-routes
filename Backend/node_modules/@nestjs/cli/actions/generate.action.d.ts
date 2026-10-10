import { GenerateCommandContext } from '../commands/index.js';
import { AbstractAction } from './abstract.action.js';
export declare class GenerateAction extends AbstractAction {
    handle(context: GenerateCommandContext): Promise<void>;
}
