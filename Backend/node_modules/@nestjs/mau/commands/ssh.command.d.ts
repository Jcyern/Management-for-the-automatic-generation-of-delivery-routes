import { CommanderStatic } from 'commander';
import { SshAction } from '../actions/ssh.action';
export declare class SshCommand {
    private readonly action;
    constructor(action: SshAction);
    load(program: CommanderStatic): void;
}
