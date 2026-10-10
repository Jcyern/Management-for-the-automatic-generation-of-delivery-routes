import { exitIfExtraArgs } from '../lib/utils/extra-args-warning.js';
import { AbstractCommand } from './abstract.command.js';
export class InfoCommand extends AbstractCommand {
    load(program) {
        program
            .command('info')
            .alias('i')
            .description('Display Nest project details.')
            .action(async (command) => {
            exitIfExtraArgs(command, 0);
            await this.action.handle();
        });
    }
}
