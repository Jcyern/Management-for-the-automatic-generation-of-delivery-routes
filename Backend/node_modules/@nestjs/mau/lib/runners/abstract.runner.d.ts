/// <reference types="node" />
import { StdioOptions } from 'child_process';
export declare class AbstractRunner {
    protected binary: string;
    protected args: string[];
    constructor(binary: string, args?: string[]);
    run(command: string, options: {
        cwd?: string;
        stdio?: StdioOptions;
        verboseError?: boolean;
        commandName?: string;
    }): Promise<null | string>;
    rawFullCommand(command: string): string;
}
