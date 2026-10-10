"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandLoader = void 0;
const chalk = require("chalk");
const actions_1 = require("../actions");
const ssh_action_1 = require("../actions/ssh.action");
const logger_1 = require("../lib/helpers/logger");
const deploy_command_1 = require("./deploy.command");
const process_access_logs_command_1 = require("./process-access-logs.command");
const ssh_command_1 = require("./ssh.command");
class CommandLoader {
    static async load(program) {
        new deploy_command_1.DeployCommand(new actions_1.DeployAction()).load(program);
        new ssh_command_1.SshCommand(new ssh_action_1.SshAction()).load(program);
        new process_access_logs_command_1.ProcessAccessLogsCommand(new actions_1.ProcessAccessLogsAction()).load(program);
        this.handleInvalidCommand(program);
    }
    static handleInvalidCommand(program) {
        program.on('command:*', () => {
            logger_1.Logger.newLine();
            logger_1.Logger.error(`Invalid command: ${chalk.red('%s')}`, program.args.join(' '));
            logger_1.Logger.raw(`See ${chalk.red('--help')} for a list of available commands.\n`);
            process.exit(1);
        });
    }
}
exports.CommandLoader = CommandLoader;
