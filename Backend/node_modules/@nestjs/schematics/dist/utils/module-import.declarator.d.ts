import { DeclarationOptions } from './module.declarator.js';
import { PathSolver } from './path.solver.js';
export declare class ModuleImportDeclarator {
    private solver;
    constructor(solver?: PathSolver);
    declare(content: string, options: DeclarationOptions): string;
    private findImportsEndpoint;
    private buildLineToInsert;
    private computeRelativePath;
}
