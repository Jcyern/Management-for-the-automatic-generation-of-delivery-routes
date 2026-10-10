import { AbstractCommand } from './abstract.command.js';
export class DeployCommand extends AbstractCommand {
    load(program) {
        program
            .command('deploy')
            // Every option belongs to `mau deploy`, so nothing is claimed here and
            // whatever the user typed is passed straight through.
            .allowUnknownOption()
            .allowExcessArguments()
            .usage('[mau-options]')
            .description('Deploy your application to the cloud (powered by Mau).')
            .action(async (_options, command) => {
            const context = { args: command.args };
            try {
                await this.action.handle(context);
            }
            catch {
                process.exit(1);
            }
        });
    }
}
