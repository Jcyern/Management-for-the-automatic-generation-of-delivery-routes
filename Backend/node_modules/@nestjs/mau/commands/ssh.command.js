"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SshCommand = void 0;
class SshCommand {
    constructor(action) {
        this.action = action;
    }
    load(program) {
        program
            .command('ssh')
            .description('Access the container via SSH')
            .option('--cmd [command]', 'Command to execute in the container', '/bin/bash')
            .option('--ignore-env', 'Ignore MAU_ environment variables and always prompt for values', false)
            .action(async (command) => {
            await this.action.handle({
                command: command.cmd,
                ignoreMauEnvVars: command.ignoreEnv,
            });
        });
    }
}
exports.SshCommand = SshCommand;
