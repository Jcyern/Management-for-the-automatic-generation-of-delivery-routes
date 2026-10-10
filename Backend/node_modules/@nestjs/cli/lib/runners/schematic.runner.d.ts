import { AbstractRunner } from './abstract.runner.js';
export declare class SchematicRunner extends AbstractRunner {
    constructor();
    static getModulePaths(): string[];
    static findClosestSchematicsBinary(): string;
}
