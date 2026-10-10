import { AbstractCollection } from './abstract.collection.js';
import { Schematic } from './nest.collection.js';
export interface CollectionSchematic {
    schema: string;
    description: string;
    aliases: string[];
}
export declare class CustomCollection extends AbstractCollection {
    getSchematics(): Schematic[];
}
