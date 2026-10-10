import { AbstractPackageManager } from './abstract.package-manager.js';
import { PackageManager } from './package-manager.js';
export declare class PackageManagerFactory {
    static create(name: PackageManager | string): AbstractPackageManager;
    static find(): Promise<AbstractPackageManager>;
}
