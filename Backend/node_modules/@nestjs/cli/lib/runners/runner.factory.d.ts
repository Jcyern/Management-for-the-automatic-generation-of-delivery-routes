import { NpmRunner } from './npm.runner.js';
import { PnpmRunner } from './pnpm.runner.js';
import { Runner } from './runner.js';
import { SchematicRunner } from './schematic.runner.js';
import { YarnRunner } from './yarn.runner.js';
import { BunRunner } from './bun.runner.js';
export declare class RunnerFactory {
    static create(runner: Runner): NpmRunner | PnpmRunner | SchematicRunner | YarnRunner | BunRunner;
}
