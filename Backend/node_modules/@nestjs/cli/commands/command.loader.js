import { red } from 'ansis';
import { AddAction, BuildAction, DeployAction, GenerateAction, InfoAction, NewAction, StartAction, UpgradeAction, } from '../actions/index.js';
import { ERROR_PREFIX } from '../lib/ui/index.js';
import { AddCommand } from './add.command.js';
import { BuildCommand } from './build.command.js';
import { DeployCommand } from './deploy.command.js';
import { GenerateCommand } from './generate.command.js';
import { InfoCommand } from './info.command.js';
import { NewCommand } from './new.command.js';
import { StartCommand } from './start.command.js';
import { UpgradeCommand } from './upgrade.command.js';
export class CommandLoader {
    static async load(program) {
        if (!program.__nestCliEsm) {
            console.error(`\n${ERROR_PREFIX} The globally installed ${red('@nestjs/cli')} is outdated and ` +
                'incompatible with the local version (which requires ESM).\n' +
                'Please upgrade your global installation:\n\n' +
                `  ${red('npm i -g @nestjs/cli')}\n`);
            process.exit(1);
        }
        new NewCommand(new NewAction()).load(program);
        new BuildCommand(new BuildAction()).load(program);
        new StartCommand(new StartAction()).load(program);
        new InfoCommand(new InfoAction()).load(program);
        new AddCommand(new AddAction()).load(program);
        new DeployCommand(new DeployAction()).load(program);
        new UpgradeCommand(new UpgradeAction()).load(program);
        await new GenerateCommand(new GenerateAction()).load(program);
        this.handleInvalidCommand(program);
    }
    static handleInvalidCommand(program) {
        program.on('command:*', () => {
            console.error(`\n${ERROR_PREFIX} Invalid command: ${red `%s`}`, program.args.join(' '));
            console.error(`See ${red `--help`} for a list of available commands.\n`);
            process.exit(1);
        });
    }
}
