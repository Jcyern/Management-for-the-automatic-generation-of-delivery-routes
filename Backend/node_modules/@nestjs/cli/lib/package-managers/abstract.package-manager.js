import { bold, gray, red } from 'ansis';
import { readFile } from 'fs/promises';
import ora from 'ora';
import { join } from 'path';
import { MESSAGES } from '../ui/index.js';
import { normalizeToKebabOrSnakeCase } from '../utils/formatting.js';
export class AbstractPackageManager {
    runner;
    constructor(runner) {
        this.runner = runner;
    }
    async install(directory, packageManager) {
        const spinner = ora({
            spinner: {
                interval: 120,
                frames: ['▹▹▹▹▹', '▸▹▹▹▹', '▹▸▹▹▹', '▹▹▸▹▹', '▹▹▹▸▹', '▹▹▹▹▸'],
            },
            text: MESSAGES.PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS,
        });
        spinner.start();
        try {
            const commandArgs = `${this.cli.install} ${this.cli.silentFlag}`;
            const collect = true;
            const normalizedDirectory = normalizeToKebabOrSnakeCase(directory);
            await this.runner.run(commandArgs, collect, join(process.cwd(), normalizedDirectory));
            spinner.succeed();
            console.info();
            console.info(MESSAGES.PACKAGE_MANAGER_INSTALLATION_SUCCEED(directory));
            console.info(MESSAGES.GET_STARTED_INFORMATION);
            console.info();
            console.info(gray(MESSAGES.CHANGE_DIR_COMMAND(directory)));
            console.info(gray(MESSAGES.START_COMMAND(packageManager)));
            console.info();
        }
        catch {
            spinner.fail();
            const commandArgs = this.cli.install;
            const commandToRun = this.runner.rawFullCommand(commandArgs);
            console.error(red(MESSAGES.PACKAGE_MANAGER_INSTALLATION_FAILED(bold(commandToRun))));
        }
    }
    async version() {
        const commandArguments = '--version';
        const collect = true;
        return this.runner.run(commandArguments, collect);
    }
    async addProduction(dependencies, tag) {
        const command = [this.cli.add, this.cli.saveFlag]
            .filter((i) => i)
            .join(' ');
        const args = dependencies
            .map((dependency) => `${dependency}@${tag}`)
            .join(' ');
        const spinner = ora({
            spinner: {
                interval: 120,
                frames: ['▹▹▹▹▹', '▸▹▹▹▹', '▹▸▹▹▹', '▹▹▸▹▹', '▹▹▹▸▹', '▹▹▹▹▸'],
            },
            text: MESSAGES.PACKAGE_MANAGER_PRODUCTION_INSTALLATION_IN_PROGRESS,
        });
        spinner.start();
        try {
            await this.add(`${command} ${args}`);
            spinner.succeed();
            return true;
        }
        catch {
            spinner.fail();
            return false;
        }
    }
    async addDevelopment(dependencies, tag) {
        const command = `${this.cli.add} ${this.cli.saveDevFlag}`;
        const args = dependencies
            .map((dependency) => `${dependency}@${tag}`)
            .join(' ');
        await this.add(`${command} ${args}`);
    }
    async add(commandArguments) {
        const collect = true;
        await this.runner.run(commandArguments, collect);
    }
    async getProduction() {
        const packageJsonContent = await this.readPackageJson();
        const packageJsonDependencies = packageJsonContent.dependencies ?? {};
        const dependencies = [];
        for (const [name, version] of Object.entries(packageJsonDependencies)) {
            dependencies.push({ name, version });
        }
        return dependencies;
    }
    async getDevelopment() {
        const packageJsonContent = await this.readPackageJson();
        const packageJsonDevDependencies = packageJsonContent.devDependencies ?? {};
        const dependencies = [];
        for (const [name, version] of Object.entries(packageJsonDevDependencies)) {
            dependencies.push({ name, version });
        }
        return dependencies;
    }
    async readPackageJson() {
        const buffer = await readFile(join(process.cwd(), 'package.json'));
        return JSON.parse(buffer.toString());
    }
    async updateProduction(dependencies) {
        const commandArguments = `${this.cli.update} ${dependencies.join(' ')}`;
        await this.update(commandArguments);
    }
    async updateDevelopment(dependencies) {
        const commandArguments = `${this.cli.update} ${dependencies.join(' ')}`;
        await this.update(commandArguments);
    }
    async update(commandArguments) {
        const collect = true;
        await this.runner.run(commandArguments, collect);
    }
    async upgradeProduction(dependencies, tag) {
        await this.deleteProduction(dependencies);
        await this.addProduction(dependencies, tag);
    }
    async upgradeDevelopment(dependencies, tag) {
        await this.deleteDevelopment(dependencies);
        await this.addDevelopment(dependencies, tag);
    }
    async deleteProduction(dependencies) {
        const command = [this.cli.remove, this.cli.saveFlag]
            .filter((i) => i)
            .join(' ');
        const args = dependencies.join(' ');
        await this.delete(`${command} ${args}`);
    }
    async deleteDevelopment(dependencies) {
        const commandArguments = `${this.cli.remove} ${this.cli.saveDevFlag} ${dependencies.join(' ')}`;
        await this.delete(commandArguments);
    }
    async delete(commandArguments) {
        const collect = true;
        await this.runner.run(commandArguments, collect);
    }
}
