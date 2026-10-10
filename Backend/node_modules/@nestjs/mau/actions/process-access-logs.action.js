"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessAccessLogsAction = void 0;
const chalk = require("chalk");
const cliProgress = require("cli-progress");
const inquirer = require("inquirer");
const logger_1 = require("../lib/helpers/logger");
const questions_1 = require("../lib/questions/questions");
const mau_service_1 = require("../lib/services/mau.service");
const s3_service_1 = require("../lib/services/s3.service");
const ui_1 = require("../lib/ui");
class ProcessAccessLogsAction {
    async handle(options) {
        logger_1.Logger.log(`Logging in to the Mau ${chalk.blueBright('https://mau.nestjs.com')} platform... ${ui_1.EMOJIS.ROCKET}`);
        try {
            const projectInfo = await this.askForMissingInformation(options);
            const session = await mau_service_1.MauService.initializeAccessLogsSession(projectInfo.apiKey, projectInfo.apiSecret);
            if (!session?.credentials) {
                throw new Error(`Failed to establish a session for retrieving Access Logs. Please ensure that your API key and secret are correct.`);
            }
            logger_1.Logger.log(`Initialized session for ${chalk.green(session.applicationName)} application... ${ui_1.EMOJIS.TADA}`);
            const questions = [
                {
                    type: 'list',
                    name: 'timeRange',
                    message: 'Which time range would you like to use to fetch access logs?',
                    choices: [
                        { name: 'Today', value: s3_service_1.TimeRange.TODAY },
                        { name: 'Last 3 days', value: s3_service_1.TimeRange.LAST_3_DAYS },
                        { name: 'Last 7 days', value: s3_service_1.TimeRange.LAST_7_DAYS },
                        { name: 'Last 30 days', value: s3_service_1.TimeRange.LAST_30_DAYS },
                    ],
                },
            ];
            if (!options.outputFile) {
                questions.push({
                    ...(0, questions_1.generateInput)('outputFile', 'Enter the output file name')(`access-logs-${new Date().toISOString().replace(/:/g, '')}.json`),
                });
            }
            const prompt = inquirer.createPromptModule();
            const answers = await prompt(questions);
            const timeRange = answers['timeRange'];
            const s3Service = new s3_service_1.S3Service();
            await s3Service.initialize(session.region, session.credentials);
            logger_1.Logger.newLine();
            const progressBar = new cliProgress.SingleBar({
                format: 'Pulling logs |' +
                    chalk.greenBright('{bar}') +
                    '| {percentage}% || {value}/{total} files',
            }, cliProgress.Presets.shades_classic);
            let outputFile = options.outputFile ?? answers['outputFile'];
            outputFile = outputFile.replace(/:/g, '');
            await s3Service.pullAllAndSave(session.bucketName, timeRange, session.pathPrefix, outputFile, {
                onStart: (total) => progressBar.start(total, 0),
                onProgress: (progress) => progressBar.update(progress),
                onError: (err) => {
                    progressBar.stop();
                    logger_1.Logger.newLine();
                    logger_1.Logger.error(`Failed to write to the output file: ${err.message}`);
                    process.exit(1);
                },
            });
            progressBar.stop();
            logger_1.Logger.newLine();
            logger_1.Logger.log(`Access logs have been successfully pulled and saved to ${chalk.greenBright(outputFile)} file.`);
            logger_1.Logger.log(`You can now visualize traffic patterns, detect anomalies, and more using the Mau platform (see ${chalk.blueBright('"Traffic"')} tab).`);
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
            throw new Error(`API key is required to initiate the Access Logs retrieval session. Generate it in the dashboard at ${chalk.redBright('https://mau.nestjs.com')}`);
        }
        if (!sshInfo.apiSecret) {
            throw new Error(`API secret is required to initiate the Access Logs retrieval session. Generate it in the dashboard at ${chalk.redBright('https://mau.nestjs.com')}`);
        }
        return sshInfo;
    }
}
exports.ProcessAccessLogsAction = ProcessAccessLogsAction;
