import { MetadataManager } from './metadata.manager.js';
export class ModuleMetadataDeclarator {
    declare(content, options) {
        const manager = new MetadataManager(content);
        const inserted = manager.insert(options.metadata, options.symbol, options.staticOptions);
        return inserted ?? content;
    }
}
