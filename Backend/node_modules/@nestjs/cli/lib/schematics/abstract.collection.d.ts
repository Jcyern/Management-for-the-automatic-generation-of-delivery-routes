import { AbstractRunner } from '../runners/index.js';
import { Schematic } from './nest.collection.js';
import { SchematicOption } from './schematic.option.js';
export declare abstract class AbstractCollection {
    protected collection: string;
    protected runner: AbstractRunner;
    constructor(collection: string, runner: AbstractRunner);
    execute(name: string, options: SchematicOption[], extraFlags?: string): Promise<void>;
    abstract getSchematics(): Schematic[];
    private buildCommandLine;
    private buildOptions;
}
