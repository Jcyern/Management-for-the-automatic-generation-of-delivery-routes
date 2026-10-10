"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployAction = void 0;
const chalk = require("chalk");
const fs_1 = require("fs");
const inquirer = require("inquirer");
const ora = require("ora");
const path_1 = require("path");
const defaults_1 = require("../lib/configuration/defaults");
const inline_application_dockerfile_factory_1 = require("../lib/factories/inline-application-dockerfile.factory");
const get_tsc_config_path_1 = require("../lib/helpers/get-tsc-config.path");
const logger_1 = require("../lib/helpers/logger");
const tsconfig_provider_1 = require("../lib/helpers/tsconfig-provider");
const typescript_loader_1 = require("../lib/helpers/typescript-loader");
const questions_1 = require("../lib/questions/questions");
const readers_1 = require("../lib/readers");
const docker_runner_1 = require("../lib/runners/docker.runner");
const mau_service_1 = require("../lib/services/mau.service");
const ui_1 = require("../lib/ui");
const load_configuration_1 = require("../lib/utils/load-configuration");
const project_utils_1 = require("../lib/utils/project-utils");
class DeployAction {
    constructor() {
        this.tsLoader = new typescript_loader_1.TypeScriptBinaryLoader();
        this.tsConfigProvider = new tsconfig_provider_1.TsConfigProvider(this.tsLoader);
    }
    async handle(options) {
        logger_1.Logger.log(`Welcome to Mau! ${chalk.blueBright('https://mau.nestjs.com')}`);
        logger_1.Logger.log(`Getting your Nest project ready for deployment... ${ui_1.EMOJIS.ROCKET}`);
        try {
            this.assertRootDirectory();
            const projectConfiguration = await (0, load_configuration_1.loadProjectConfiguration)();
            const deployInfo = await this.askForMissingInformation(options, {
                projectConfiguration,
            });
            const deploymentPayload = await mau_service_1.MauService.initializeDeployment(deployInfo.apiKey, deployInfo.apiSecret);
            this.ensureDockerignoreExists(options);
            if (options.dockerfile) {
                this.assertCustomDockerfileExists(options.dockerfile);
            }
            const compiledEntryFile = this.getCompiledEntryFilePath(options, deployInfo, projectConfiguration);
            const dockerRunner = new docker_runner_1.DockerRunner();
            logger_1.Logger.log(`Logging in to the Docker registry...`);
            const { username, password } = this.extractUsernameAndPassword(deploymentPayload.registryAuthToken);
            await dockerRunner.login(username, password, deploymentPayload.registryUri);
            logger_1.Logger.log(`Building Docker image...`);
            if (!options.dockerfile) {
                logger_1.Logger.raw(`${chalk.blueBright(`Hint: To use a custom Dockerfile, use the ${chalk.white(`--dockerfile`)} flag.`)}`);
            }
            logger_1.Logger.newLine();
            const tag = `${deploymentPayload.registryUri}:${deploymentPayload.uniqueTag}`;
            const dockerBuildOptions = {
                dockerfilePath: options.dockerfile,
                dockerFlags: options.dockerFlags,
                inlineDockerfile: options.dockerfile
                    ? undefined
                    : inline_application_dockerfile_factory_1.InlineApplicationDockerfileFactory.create({
                        image: options.image,
                        applicationName: deployInfo.name,
                        entryFile: options.entryFile ?? compiledEntryFile,
                        cpuArchitecture: deploymentPayload.cpuArchitecture,
                    }),
            };
            if (options.dockerFlags) {
                const platform = deploymentPayload.cpuArchitecture === 'arm64'
                    ? 'linux/arm64'
                    : 'linux/amd64';
                dockerBuildOptions.dockerFlags = {
                    ...dockerBuildOptions.dockerFlags,
                    platform,
                };
            }
            await dockerRunner
                .build(tag, {
                ...dockerBuildOptions,
                buildx: true,
            })
                .catch(async (err) => {
                console.error(err);
                logger_1.Logger.raw(`${chalk.yellowBright(`Warning: Failed to build Docker image with buildx. This may be due to missing buildx support on your system. Falling back to regular Docker build.`)}`);
                await dockerRunner.build(tag, dockerBuildOptions);
            });
            logger_1.Logger.newLine();
            logger_1.Logger.log(`Docker image built successfully! ${ui_1.EMOJIS.UNICORN}`);
            logger_1.Logger.log(`Pushing Docker image to the registry...`);
            await dockerRunner.push(tag);
            logger_1.Logger.newLine();
            logger_1.Logger.log(`Docker image pushed successfully, almost there! ${ui_1.EMOJIS.RAISED_HANDS}`);
            const spinner = ora({
                text: `Creating ${chalk.green('Mau deployment')} and updating your service...`,
            });
            spinner.start();
            const finalizePayload = await mau_service_1.MauService.finalizeDeployment(deployInfo.apiKey, deployInfo.apiSecret, {
                uri: tag,
                version: deploymentPayload.nextVersion,
                waitForServiceStable: options.waitForServiceStability,
                hash: options.hash,
                onConflict: options.onConflict,
            });
            spinner.succeed();
            if ('error' in finalizePayload) {
                logger_1.Logger.error(finalizePayload.error);
            }
            else {
                if (finalizePayload?.deploymentId && finalizePayload?.jobId) {
                    logger_1.Logger.log(`Waiting for the deployment to stabilize...`);
                    await this.waitForDeploymentToComplete(deployInfo.apiKey, deployInfo.apiSecret, finalizePayload);
                }
                logger_1.Logger.log(`A new version (${finalizePayload.version}) of your service has been successfully ${finalizePayload.message}! ${ui_1.EMOJIS.TADA}`);
            }
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
    assertRootDirectory() {
        const fileSystemReader = new readers_1.FileSystemReader(process.cwd());
        const fileOrError = fileSystemReader.readAnyOf([
            'nest-cli.json',
            '.nestcli.json',
            '.nest-cli.json',
            'nest.json',
        ]);
        if (!fileOrError || fileOrError instanceof Error) {
            throw new Error(`Could not find a Nest configuration file (${chalk.red('nest-cli.json')}) in the current directory.
${chalk.bold.red('>')} Please make sure you are running this command in the root directory of your project.`);
        }
    }
    async askForMissingInformation(options, context) {
        const deployInfo = {
            apiKey: options.ignoreMauEnvVars ? undefined : process.env.MAU_KEY,
            apiSecret: options.ignoreMauEnvVars ? undefined : process.env.MAU_SECRET,
            name: options.name,
        };
        const prompt = inquirer.createPromptModule();
        const isMonorepo = context.projectConfiguration.monorepo &&
            !!context.projectConfiguration.projects;
        if ((isMonorepo && !deployInfo.name) ||
            !deployInfo.apiSecret ||
            !deployInfo.apiKey) {
            logger_1.Logger.log(`Before we deploy your Nest project, we need to gather a bit more information.`);
        }
        if (isMonorepo && !deployInfo.name) {
            const defaultLabel = ' [ Default ]';
            let defaultProjectName = context.projectConfiguration.sourceRoot + defaultLabel;
            for (const property in context.projectConfiguration.projects) {
                if (context.projectConfiguration.projects[property].sourceRoot ===
                    context.projectConfiguration.sourceRoot) {
                    defaultProjectName = property + defaultLabel;
                    break;
                }
            }
            const projects = (0, project_utils_1.moveDefaultProjectToStart)(context.projectConfiguration, defaultProjectName, defaultLabel);
            const answers = await (0, project_utils_1.askForProjectName)(`Which project would you like to deploy?`, projects);
            const project = answers.appName.replace(defaultLabel, '');
            deployInfo.name = project;
        }
        else if (isMonorepo) {
            const project = deployInfo.name
                ? context.projectConfiguration.projects?.[deployInfo.name]
                : undefined;
            if (!project) {
                throw new Error(`Project "${deployInfo.name}" not found in the configuration file`);
            }
        }
        if (!deployInfo.apiKey) {
            const message = 'Please, enter your API key generated from the Mau platform';
            const questions = [
                {
                    ...(0, questions_1.generateInput)('apiKey', message)(),
                    mask: '*',
                    type: 'password',
                },
            ];
            const answers = await prompt(questions);
            deployInfo.apiKey = answers['apiKey'];
        }
        if (!deployInfo.apiSecret) {
            const message = 'Please, enter your API secret generated from the Mau platform';
            const questions = [
                {
                    ...(0, questions_1.generateInput)('apiSecret', message)(),
                    mask: '*',
                    type: 'password',
                },
            ];
            const answers = await prompt(questions);
            deployInfo.apiSecret = answers['apiSecret'];
        }
        if (!deployInfo.apiKey) {
            throw new Error(`API key is required to initiate deployment. Generate it in the dashboard at ${chalk.redBright('https://mau.nestjs.com')}`);
        }
        if (!deployInfo.apiSecret) {
            throw new Error(`API secret is required to initiate deployment. Generate it in the dashboard at ${chalk.redBright('https://mau.nestjs.com')}`);
        }
        return deployInfo;
    }
    assertCustomDockerfileExists(dockerfile) {
        if (!this.fileExists(dockerfile)) {
            throw new Error(`Custom Dockerfile not found at the specified path: "${chalk.red(dockerfile)}".`);
        }
    }
    ensureDockerignoreExists(options) {
        const dockerignoreFile = options.dockerfile
            ? `${options.dockerfile}.dockerignore`
            : null;
        if (!this.fileExists('.dockerignore') &&
            ((dockerignoreFile && !this.fileExists(dockerignoreFile)) ||
                !dockerignoreFile)) {
            const spinner = ora({
                text: `No .dockerignore file found. Creating one...`,
            });
            spinner.start();
            const dockerignoreContent = `node_modules
`;
            (0, fs_1.writeFileSync)((0, path_1.join)(process.cwd(), '.dockerignore'), dockerignoreContent);
            spinner.succeed();
        }
    }
    extractUsernameAndPassword(authToken) {
        const token = Buffer.from(authToken, 'base64').toString('utf-8');
        const creds = token.split(':', 2);
        const [username, password] = [creds[0], creds[1]];
        return { username, password };
    }
    fileExists(path) {
        try {
            (0, fs_1.accessSync)(path);
            return true;
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                return false;
            }
            throw err;
        }
    }
    getCompiledEntryFilePath(options, deployInfo, configuration) {
        if (options.dockerfile || options.entryFile) {
            return;
        }
        let applicationConfiguration;
        if (deployInfo.name) {
            const applicationRef = configuration.projects?.[deployInfo.name];
            if (applicationRef) {
                applicationConfiguration = {
                    sourceRoot: applicationRef.sourceRoot,
                    entryFile: applicationRef.entryFile,
                };
            }
            else {
                throw new Error(`Project "${chalk.red(deployInfo.name)}" not found in the configuration file`);
            }
        }
        else {
            applicationConfiguration = {
                sourceRoot: configuration.sourceRoot ?? defaults_1.defaultConfiguration.sourceRoot,
                entryFile: configuration.entryFile ?? defaults_1.defaultConfiguration.entryFile,
            };
        }
        const pathToTsconfig = (0, get_tsc_config_path_1.getTscConfigPath)(configuration, deployInfo.name);
        let outDirName;
        try {
            const typescriptOptions = this.tsConfigProvider.getByConfigFilename(pathToTsconfig)?.options;
            outDirName =
                typescriptOptions?.outDir && typescriptOptions?.baseUrl
                    ? typescriptOptions.outDir.replace(typescriptOptions.baseUrl + '/', '')
                    : defaults_1.defaultOutDir;
        }
        catch (err) {
            logger_1.Logger.log(chalk.blueBright(`No tsconfig.json found. Fallback to the default output directory ("dist").`));
            outDirName = defaults_1.defaultOutDir;
        }
        const compiledEntryFile = (0, path_1.join)(outDirName, applicationConfiguration.entryFile);
        return compiledEntryFile;
    }
    async waitForDeploymentToComplete(apiKey, apiSecret, payload) {
        let isSettled = false;
        while (!isSettled) {
            const deploymentStatus = await mau_service_1.MauService.verifyDeploymentStatus(apiKey, apiSecret, {
                deploymentId: payload.deploymentId,
                jobId: payload.jobId,
            });
            if (!deploymentStatus.inProgress) {
                isSettled = true;
                if (deploymentStatus.status === 'failed') {
                    throw new Error('Deployment failed. Please check the logs in the Mau dashboard for more information.');
                }
            }
            else {
                await new Promise((resolve) => setTimeout(resolve, 60000));
            }
        }
    }
}
exports.DeployAction = DeployAction;
