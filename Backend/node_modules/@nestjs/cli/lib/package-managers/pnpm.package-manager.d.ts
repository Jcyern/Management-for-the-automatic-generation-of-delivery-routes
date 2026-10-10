import { AbstractPackageManager } from './abstract.package-manager.js';
import { PackageManagerCommands } from './package-manager-commands.js';
export declare class PnpmPackageManager extends AbstractPackageManager {
    constructor();
    get name(): string;
    get cli(): PackageManagerCommands;
}
