import { Command } from 'commander';
export declare class CommandLoader {
    static load(program: Command): Promise<void>;
    private static handleInvalidCommand;
}
