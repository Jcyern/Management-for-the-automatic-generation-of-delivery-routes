import { Runner, RunnerFactory } from '../runners/index.js';
import { Collection } from './collection.js';
import { CustomCollection } from './custom.collection.js';
import { NestCollection } from './nest.collection.js';
export class CollectionFactory {
    static create(collection) {
        const schematicRunner = RunnerFactory.create(Runner.SCHEMATIC);
        if (collection === Collection.NESTJS) {
            return new NestCollection(schematicRunner);
        }
        else {
            return new CustomCollection(collection, schematicRunner);
        }
    }
}
