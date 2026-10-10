import { AbstractCollection } from './abstract.collection.js';
import { Collection } from './collection.js';
export declare class CollectionFactory {
    static create(collection: Collection | string): AbstractCollection;
}
