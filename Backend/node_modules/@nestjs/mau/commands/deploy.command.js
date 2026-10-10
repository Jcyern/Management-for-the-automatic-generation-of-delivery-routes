"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployCommand = void 0;
const inline_application_dockerfile_factory_1 = require("../lib/factories/inline-application-dockerfile.factory");
class DeployCommand {
    constructor(action) {
        this.action = action;
    }
    load(program) {
        program
            .command('deploy [name]')
            .alias('d')
            .description('Deploy Nest project to the cloud')
            .option('--dockerfile [path]', 'Path to the custom Dockerfile')
            .option('--image [image]', 'Base docker image to use for the deployment', inline_application_dockerfile_factory_1.DEFAULT_IMAGE)
            .option('--ignore-env', 'Ignore MAU_ environment variables and always prompt for values', false)
            .option('--wait-for-service-stability', 'Wait for the deployment to be completed and service to be stable before exiting. Applies to applications only (not tasks or lambdas)')
            .option('--entry-file [entryFile]', 'Entry file for the application, defaults to "dist/main.js" or "dist/apps/<name>/main.js" depending on the nest-cli.json configuration')
            .option('--on-conflict <action>', 'Action to take when a deployment conflict is detected (abort or bump). When "abort" is selected, the deployment will be aborted. When "bump" is selected, the deployment will be continued with a new version number. Default is "bump"', 'bump')
            .option('--target <target>', 'Sets the Docker target build stage to use when building the image.')
            .option('--build-arg <buildArg>', 'Sets build-time variables for the Docker build. The argument must be in the form: key=value', (val, memo) => {
            memo.push(val);
            return memo;
        }, [])
            .option('--no-cache', 'Do not use cache when building the image.')
            .action(async (name, command) => {
            await this.action.handle({
                name,
                dockerfile: command.dockerfile,
                image: command.image,
                waitForServiceStability: command.waitForServiceStability,
                ignoreMauEnvVars: command.ignoreEnv,
                hash: process.env.GIT_HASH,
                onConflict: command.onConflict,
                entryFile: command.entryFile,
                dockerFlags: {
                    target: command.target,
                    buildArgs: command.buildArg,
                    noCache: !command.cache,
                },
            });
        });
    }
}
exports.DeployCommand = DeployCommand;
