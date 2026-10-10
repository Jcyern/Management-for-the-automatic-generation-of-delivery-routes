import { CommanderStatic } from 'commander';
import { ProcessAccessLogsAction } from '../actions';
export declare class ProcessAccessLogsCommand {
    private readonly action;
    constructor(action: ProcessAccessLogsAction);
    load(program: CommanderStatic): void;
}
