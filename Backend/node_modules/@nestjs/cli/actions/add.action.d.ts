import { AddCommandContext } from '../commands/index.js';
import { AbstractAction } from './abstract.action.js';
export declare class AddAction extends AbstractAction {
    handle(context: AddCommandContext): Promise<void>;
    private getSourceRoot;
    private installPackage;
    private addLibrary;
    private getPackageName;
    private getCollectionName;
    private getTagName;
}
