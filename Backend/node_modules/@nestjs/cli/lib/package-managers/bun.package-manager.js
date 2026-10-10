import { Runner, RunnerFactory } from '../runners/index.js';
import { AbstractPackageManager } from './abstract.package-manager.js';
import { PackageManager } from './package-manager.js';
export class BunPackageManager extends AbstractPackageManager {
    constructor() {
        super(RunnerFactory.create(Runner.BUN));
    }
    get name() {
        return PackageManager.BUN.toUpperCase();
    }
    get cli() {
        return {
            install: 'install',
            add: 'add',
            update: 'update',
            remove: 'remove',
            saveFlag: '--save',
            saveDevFlag: '--dev',
            silentFlag: '--silent',
        };
    }
}
