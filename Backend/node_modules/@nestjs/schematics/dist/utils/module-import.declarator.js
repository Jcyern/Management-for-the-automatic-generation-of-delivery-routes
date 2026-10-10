import { normalize } from '@angular-devkit/core';
import { PathSolver } from './path.solver.js';
export class ModuleImportDeclarator {
    solver;
    constructor(solver = new PathSolver()) {
        this.solver = solver;
    }
    declare(content, options) {
        const toInsert = this.buildLineToInsert(options);
        const contentLines = content.split('\n');
        const finalImportIndex = this.findImportsEndpoint(contentLines);
        contentLines.splice(finalImportIndex + 1, 0, toInsert);
        return contentLines.join('\n');
    }
    findImportsEndpoint(contentLines) {
        const reversedContent = Array.from(contentLines).reverse();
        const reverseImports = reversedContent.filter((line) => line.match(/\} from ('|")/));
        if (reverseImports.length <= 0) {
            return 0;
        }
        return contentLines.indexOf(reverseImports[0]);
    }
    buildLineToInsert(options) {
        return `import { ${options.symbol} } from '${this.computeRelativePath(options)}';`;
    }
    computeRelativePath(options) {
        let importModulePath;
        if (options.type !== undefined) {
            importModulePath = normalize(`/${options.path}/${options.name}.${options.type}`);
        }
        else {
            importModulePath = normalize(`/${options.path}/${options.name}`);
        }
        const relativePath = this.solver.relative(options.module, importModulePath);
        return options.isEsm ? `${relativePath}.js` : relativePath;
    }
}
