import { CommanderStatic } from 'commander';
import { DeployAction } from '../actions/deploy.action';
export declare class DeployCommand {
    private readonly action;
    constructor(action: DeployAction);
    load(program: CommanderStatic): void;
}
