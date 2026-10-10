import { Command } from 'commander';
import { AbstractAction } from '../actions/abstract.action.js';
export declare abstract class AbstractCommand {
    protected action: AbstractAction;
    constructor(action: AbstractAction);
    abstract load(program: Command): void;
}
