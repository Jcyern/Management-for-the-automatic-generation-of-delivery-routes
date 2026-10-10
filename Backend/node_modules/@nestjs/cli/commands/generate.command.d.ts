import { Command } from 'commander';
import { AbstractCommand } from './abstract.command.js';
export declare class GenerateCommand extends AbstractCommand {
    load(program: Command): Promise<void>;
    private buildDescription;
    private buildSchematicsListAsTable;
    private getCollection;
    private getSchematics;
}
