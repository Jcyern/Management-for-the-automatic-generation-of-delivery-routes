import { Tree } from '@angular-devkit/schematics';
import { UpgradeReport } from '../upgrade.utils.js';
export declare function isSupportedNodeVersion(version: string): boolean;
export declare function checkNodeVersion(report: UpgradeReport, version?: string): void;
export declare function assertUpgradeable(tree: Tree, report: UpgradeReport): void;
