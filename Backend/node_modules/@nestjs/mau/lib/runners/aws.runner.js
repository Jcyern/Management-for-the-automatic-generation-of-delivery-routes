"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsRunner = void 0;
const abstract_runner_1 = require("./abstract.runner");
class AwsRunner extends abstract_runner_1.AbstractRunner {
    constructor(credentials) {
        const isWindows = process.platform === 'win32';
        const binary = `AWS_ACCESS_KEY_ID=${credentials.accessKeyId} AWS_SECRET_ACCESS_KEY=${credentials.secretAccessKey} AWS_SESSION_TOKEN=${credentials.sessionToken} aws`;
        super(isWindows ? `npx cross-env ${binary}` : binary);
    }
    async executeCommand(options) {
        const command = `ecs execute-command \
    --region ${options.region} \
    --cluster ${options.cluster} \
    --task ${options.task} \
    --container ${options.container} \
    --command "${options.command}" \
    --interactive`;
        await this.run(command, {
            commandName: 'aws ecs execute-command',
        });
    }
}
exports.AwsRunner = AwsRunner;
