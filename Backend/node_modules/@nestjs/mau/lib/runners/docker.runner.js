"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerRunner = void 0;
const fs_1 = require("fs");
const os_1 = require("os");
const abstract_runner_1 = require("./abstract.runner");
const isAppleSilicon = process.platform === 'darwin' || (0, os_1.arch)() === 'arm64';
class DockerRunner extends abstract_runner_1.AbstractRunner {
    constructor() {
        const binary = isAppleSilicon ? 'DOCKER_BUILDKIT=1 docker' : 'docker';
        super(binary);
    }
    async build(tag, options = {
        dockerFlags: {},
    }) {
        const buildCommand = this.getBuildCommandWithFlags(tag, { buildx: options.buildx }, options.dockerFlags);
        if (options.buildx) {
            await this.run('buildx version', {
                commandName: 'docker buildx version',
                verboseError: true,
                stdio: 'ignore',
            });
        }
        if (isAppleSilicon) {
            const command = `${buildCommand} -f ${options.dockerfilePath
                ? `${options.dockerfilePath} .`
                : `- . <<EOF
${options.inlineDockerfile}
EOF`}`;
            await this.run(command, {
                commandName: 'docker build',
            });
        }
        else {
            if (options.dockerfilePath) {
                await this.run(`${buildCommand} -f ${options.dockerfilePath} .`, {
                    commandName: 'docker build',
                });
            }
            else {
                const uniqueTempName = `Dockerfile.temp-${Date.now()}`;
                (0, fs_1.writeFileSync)(uniqueTempName, options.inlineDockerfile);
                await this.run(`${buildCommand} -f ${uniqueTempName} .`, {
                    commandName: 'docker build',
                }).finally(() => {
                    (0, fs_1.unlinkSync)(uniqueTempName);
                });
            }
        }
    }
    async login(username, password, registry) {
        await this.run(`login ${registry} -u ${username} -p ${password}`, {
            stdio: ['inherit', 'ignore', 'ignore'],
            commandName: 'docker login',
        });
    }
    async push(tag) {
        await this.run(`push ${tag}`, {
            commandName: 'docker push',
        });
    }
    getBuildCommandWithFlags(tag, opts, flags) {
        const baseCommand = opts.buildx
            ? `buildx build -t ${tag}`
            : `build -t ${tag}`;
        const targetFlag = flags.target ? ` --target ${flags.target}` : '';
        const noCacheFlag = flags.noCache ? ' --no-cache' : '';
        const buildArgsFlag = flags.buildArgs
            ? flags.buildArgs.map((arg) => ` --build-arg ${arg}`).join('')
            : '';
        const platformFlag = flags.platform ? ` --platform ${flags.platform}` : '';
        return [
            baseCommand,
            targetFlag,
            noCacheFlag,
            buildArgsFlag,
            platformFlag,
        ].join('');
    }
}
exports.DockerRunner = DockerRunner;
