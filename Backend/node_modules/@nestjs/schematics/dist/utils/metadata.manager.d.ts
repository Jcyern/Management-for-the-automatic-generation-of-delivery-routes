import { DeclarationOptions } from './module.declarator.js';
export declare class MetadataManager {
    private content;
    constructor(content: string);
    insert(metadata: string, symbol: string, staticOptions?: DeclarationOptions['staticOptions']): string | undefined;
    private findFirstDecoratorMetadata;
    private getSourceNodes;
    private insertMetadataToEmptyModuleDecorator;
    private insertNewMetadataToDecorator;
    private insertSymbolToMetadata;
    private mergeSymbolAndExpr;
    private addBlankLines;
}
