import { Runner, RunnerFactory } from '../runners/index.js';
import { AbstractPackageManager } from './abstract.package-manager.js';
import { PackageManager } from './package-manager.js';
export class YarnPackageManager extends AbstractPackageManager {
    constructor() {
        super(RunnerFactory.create(Runner.YARN));
    }
    get name() {
        return PackageManager.YARN.toUpperCase();
    }
    get cli() {
        return {
            install: 'install',
            add: 'add',
            update: 'upgrade',
            remove: 'remove',
            saveFlag: '',
            saveDevFlag: '-D',
            silentFlag: '--silent',
        };
    }
}
