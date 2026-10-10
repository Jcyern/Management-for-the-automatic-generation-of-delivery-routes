"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SshAction = void 0;
const chalk = require("chalk");
const inquirer = require("inquirer");
const logger_1 = require("../lib/helpers/logger");
const questions_1 = require("../lib/questions/questions");
const aws_runner_1 = require("../lib/runners/aws.runner");
const mau_service_1 = require("../lib/services/mau.service");
const ui_1 = require("../lib/ui");
class SshAction {
    async handle(options) {
        logger_1.Logger.log(`Logging in to the Mau ${chalk.blueBright('https://mau.nestjs.com')} platform... ${ui_1.EMOJIS.ROCKET}`);
        try {
            const projectInfo = await this.askForMissingInformation(options);
            const session = await mau_service_1.MauService.initializeSshSession(projectInfo.apiKey, projectInfo.apiSecret);
            if (!session?.credentials) {
                throw new Error(`Failed to establish SSH session. Please, make sure your API key and secret are correct.`);
            }
            if (session.tasks.length === 0) {
                throw new Error(`No tasks found for the container ${session.containerName}. Please, make sure at least one node is running for the given service.`);
            }
            let taskArn;
            if (session.tasks.length > 1) {
                const questions = [
                    {
                        type: 'list',
                        name: 'taskId',
                        message: 'Select the AWS task to SSH into',
                        choices: session.tasks.map((task, index) => {
                            const id = task.arn.split('/').pop()?.slice(0, 8);
                            const startedAt = task.startedAt
                                ? new Date(task.startedAt).toLocaleString()
                                : 'N/A';
                            return {
                                name: `Task [${index}] - ${id} (started at: ${startedAt})`,
                                value: task.arn,
                            };
                        }),
                    },
                ];
                const prompt = inquirer.createPromptModule();
                const answers = await prompt(questions);
                taskArn = answers['taskId'];
            }
            else {
                taskArn = session.tasks[0].arn;
            }
            logger_1.Logger.log(`Initializing SSH session to ${chalk.green(session.containerName)}... ${ui_1.EMOJIS.TADA}`);
            const awsRunner = new aws_runner_1.AwsRunner({
                accessKeyId: session.credentials.accessKeyId,
                secretAccessKey: session.credentials.secretAccessKey,
                sessionToken: session.credentials.sessionToken,
            });
            await awsRunner.executeCommand({
                region: session.region,
                cluster: session.clusterName,
                container: session.containerName,
                task: taskArn,
                command: options.command,
            });
            process.exit(0);
        }
        catch (err) {
            if (typeof err === 'string') {
                logger_1.Logger.newLine();
                logger_1.Logger.error(err);
            }
            else if (err?.message) {
                logger_1.Logger.newLine();
                logger_1.Logger.error(err.message);
            }
            process.exit(1);
        }
    }
    async askForMissingInformation(options) {
        const sshInfo = {
            apiKey: options.ignoreMauEnvVars ? undefined : process.env.MAU_KEY,
            apiSecret: options.ignoreMauEnvVars ? undefined : process.env.MAU_SECRET,
        };
        const prompt = inquirer.createPromptModule();
        if (!sshInfo.apiKey) {
            const message = 'Please, enter your API key generated from the Mau platform';
            const questions = [
                {
                    ...(0, questions_1.generateInput)('apiKey', message)(),
                    mask: '*',
                    type: 'password',
                },
            ];
            const answers = await prompt(questions);
            sshInfo.apiKey = answers['apiKey'];
        }
        if (!sshInfo.apiSecret) {
            const message = 'Please, enter your API secret generated from the Mau platform';
            const questions = [
                {
                    ...(0, questions_1.generateInput)('apiSecret', message)(),
                    mask: '*',
                    type: 'password',
                },
            ];
            const answers = await prompt(questions);
            sshInfo.apiSecret = answers['apiSecret'];
        }
        if (!sshInfo.apiKey) {
            throw new Error(`API key is required to initiate SSH session. Generate it in the dashboard at ${chalk.redBright('https://mau.nestjs.com')}`);
        }
        if (!sshInfo.apiSecret) {
            throw new Error(`API secret is required to initiate SSH session. Generate it in the dashboard at ${chalk.redBright('https://mau.nestjs.com')}`);
        }
        return sshInfo;
    }
}
exports.SshAction = SshAction;
