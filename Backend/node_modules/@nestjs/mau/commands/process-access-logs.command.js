"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessAccessLogsCommand = void 0;
class ProcessAccessLogsCommand {
    constructor(action) {
        this.action = action;
    }
    load(program) {
        program
            .command('access-logs')
            .description('Process access logs and generate a report file')
            .option('-f, --output-file <outputFile>', 'Output file name (e.g., access-logs.json)')
            .option('--ignore-env', 'Ignore MAU_ environment variables and always prompt for values', false)
            .action(async (command) => {
            await this.action.handle({
                outputFile: command.outputFile,
                ignoreMauEnvVars: command.ignoreEnv,
            });
        });
    }
}
exports.ProcessAccessLogsCommand = ProcessAccessLogsCommand;
