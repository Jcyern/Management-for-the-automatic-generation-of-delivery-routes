import { Runner, RunnerFactory } from '../runners/index.js';
import { AbstractPackageManager } from './abstract.package-manager.js';
import { PackageManager } from './package-manager.js';
export class NpmPackageManager extends AbstractPackageManager {
    constructor() {
        super(RunnerFactory.create(Runner.NPM));
    }
    get name() {
        return PackageManager.NPM.toUpperCase();
    }
    get cli() {
        return {
            install: 'install',
            add: 'install',
            update: 'update',
            remove: 'uninstall',
            saveFlag: '--save',
            saveDevFlag: '--save-dev',
            silentFlag: '--silent',
        };
    }
}
