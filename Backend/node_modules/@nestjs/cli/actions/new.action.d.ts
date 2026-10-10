import { NewCommandContext } from '../commands/index.js';
import { AbstractAction } from './abstract.action.js';
export declare class NewAction extends AbstractAction {
    handle(context: NewCommandContext): Promise<void>;
}
export declare const retrieveCols: () => number;
export declare const exit: () => never;
