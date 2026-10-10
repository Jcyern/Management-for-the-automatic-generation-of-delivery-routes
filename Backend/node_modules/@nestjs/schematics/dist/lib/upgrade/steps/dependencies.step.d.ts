import { Rule, Tree } from '@angular-devkit/schematics';
import type { UpgradeOptions } from '../upgrade.schema.js';
import { UpgradeReport } from '../upgrade.utils.js';
export declare const NEST_V12_PACKAGES: Record<string, string>;
export declare function updateNestDependencies(options: UpgradeOptions, report: UpgradeReport): Rule;
export declare function detectPackageManager(tree: Tree): string;
export declare function installDependencies(options: UpgradeOptions, report: UpgradeReport): Rule;
