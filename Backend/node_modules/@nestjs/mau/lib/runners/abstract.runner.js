"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractRunner = void 0;
const chalk = require("chalk");
const child_process_1 = require("child_process");
const logger_1 = require("../helpers/logger");
const COMMAND_NOT_FOUND = 127;
class AbstractRunner {
    constructor(binary, args = []) {
        this.binary = binary;
        this.args = args;
    }
    async run(command, options) {
        options.stdio ??= 'inherit';
        options.verboseError ??= false;
        const args = [command];
        const spawnOptions = {
            cwd: options.cwd ?? process.cwd(),
            stdio: options.stdio,
            shell: true,
        };
        return new Promise((resolve, reject) => {
            const child = (0, child_process_1.spawn)(`${this.binary}`, [...this.args, ...args], spawnOptions);
            child.on('close', (code) => {
                if (code === 0) {
                    resolve(null);
                }
                else {
                    const message = options.verboseError
                        ? `Failed to execute command: ${this.binary} ${command}`
                        : `Failed to execute command: ${chalk.red(options.commandName)}`;
                    if (code === COMMAND_NOT_FOUND) {
                        logger_1.Logger.newLine();
                        logger_1.Logger.error(`Command not found: ${chalk.red(this.binary)}\nSounds like you're missing a dependency that is required to run this command.\nCheck the documentation for more information.`);
                    }
                    reject(message);
                }
            });
        });
    }
    rawFullCommand(command) {
        const commandArgs = [...this.args, command];
        return `${this.binary} ${commandArgs.join(' ')}`;
    }
}
exports.AbstractRunner = AbstractRunner;
