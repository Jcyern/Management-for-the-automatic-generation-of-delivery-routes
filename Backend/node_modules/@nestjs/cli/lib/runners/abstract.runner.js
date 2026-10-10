import { red } from 'ansis';
import { spawn } from 'child_process';
import { MESSAGES } from '../ui/index.js';
export class AbstractRunner {
    binary;
    args;
    constructor(binary, args = []) {
        this.binary = binary;
        this.args = args;
    }
    async run(command, collect = false, cwd = process.cwd()) {
        const args = [command];
        const options = {
            cwd,
            stdio: collect ? 'pipe' : 'inherit',
            shell: true,
        };
        return new Promise((resolve, reject) => {
            const fullCommand = [this.binary, ...this.args, ...args].join(' ');
            const child = spawn(fullCommand, options);
            if (collect) {
                const chunks = [];
                const errorChunks = [];
                child.stdout.on('data', (data) => chunks.push(data));
                // stderr is piped in collect mode and must be consumed too: an unread
                // pipe blocks the child once the OS buffer fills (e.g. npm printing
                // peer-dependency warnings), and `close` would then never fire.
                child.stderr.on('data', (data) => errorChunks.push(data));
                child.on('close', (code) => {
                    if (code === 0) {
                        resolve(Buffer.concat(chunks)
                            .toString()
                            .replace(/\r\n|\n/g, ''));
                    }
                    else {
                        console.error(red(MESSAGES.RUNNER_EXECUTION_ERROR(fullCommand)));
                        const errorOutput = Buffer.concat(errorChunks).toString().trim();
                        if (errorOutput) {
                            console.error(red(errorOutput));
                        }
                        reject();
                    }
                });
            }
            else {
                child.on('close', (code) => {
                    if (code === 0) {
                        resolve(null);
                    }
                    else {
                        console.error(red(MESSAGES.RUNNER_EXECUTION_ERROR(fullCommand)));
                        reject();
                    }
                });
            }
        });
    }
    /**
     * @param command
     * @returns The entire command that will be ran when calling `run(command)`.
     */
    rawFullCommand(command) {
        const commandArgs = [...this.args, command];
        return `${this.binary} ${commandArgs.join(' ')}`;
    }
}
