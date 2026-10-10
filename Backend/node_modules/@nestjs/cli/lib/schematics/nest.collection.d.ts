import { AbstractRunner } from '../runners/index.js';
import { AbstractCollection } from './abstract.collection.js';
import { SchematicOption } from './schematic.option.js';
export interface Schematic {
    name: string;
    alias: string;
    description: string;
}
export declare class NestCollection extends AbstractCollection {
    private static schematics;
    constructor(runner: AbstractRunner);
    execute(name: string, options: SchematicOption[]): Promise<void>;
    getSchematics(): Schematic[];
    private validate;
}
