import * as ts from 'typescript';
import { TypeScriptBinaryLoader } from '../typescript-loader.js';
export type TsConfigProviderOutput = Pick<ts.ParsedCommandLine, 'options' | 'fileNames' | 'projectReferences'> & {
    exclude: string[];
};
export declare class TsConfigProvider {
    private readonly typescriptLoader;
    constructor(typescriptLoader: TypeScriptBinaryLoader);
    getByConfigFilename(configFilename: string): TsConfigProviderOutput;
    private parseExclude;
    private normalizeExclude;
}
