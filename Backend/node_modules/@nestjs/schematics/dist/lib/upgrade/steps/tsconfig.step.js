import { readJsonFile } from '../upgrade.utils.js';
const NODENEXT_SNIPPET = `{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "resolvePackageJsonExports": true,
    "target": "ES2023"
  }
}`;
export function checkTsConfig(report) {
    return (tree) => {
        const tsconfig = readJsonFile(tree, 'tsconfig.json');
        const compilerOptions = tsconfig?.compilerOptions;
        if (!compilerOptions || typeof compilerOptions !== 'object') {
            return tree;
        }
        const module = String(compilerOptions.module ?? '').toLowerCase();
        const moduleResolution = String(compilerOptions.moduleResolution ?? '').toLowerCase();
        const legacyResolution = moduleResolution === '' ||
            moduleResolution === 'node' ||
            moduleResolution === 'node10' ||
            moduleResolution === 'classic';
        if (module === 'commonjs' && legacyResolution) {
            report.action('tsconfig.json uses "module": "commonjs" with a legacy module resolution, which cannot resolve the ESM-only NestJS 12 packages. ' +
                `Update "compilerOptions" as follows (this is what the v11 CLI generates; your emitted code stays CommonJS as long as package.json has no "type": "module"):\n${NODENEXT_SNIPPET}`);
        }
        else if (legacyResolution && moduleResolution !== '') {
            report.action(`tsconfig.json uses "moduleResolution": "${compilerOptions.moduleResolution}", which TypeScript 6 no longer supports and which cannot resolve the ESM-only NestJS 12 packages. Switch to "nodenext" (or "bundler").`);
        }
        const buildConfig = readJsonFile(tree, 'tsconfig.build.json');
        if (buildConfig) {
            const buildCompilerOptions = buildConfig.compilerOptions;
            const hasRootDir = (buildCompilerOptions &&
                typeof buildCompilerOptions === 'object' &&
                'rootDir' in buildCompilerOptions) ||
                (compilerOptions && 'rootDir' in compilerOptions);
            if (!hasRootDir) {
                report.action('tsconfig.build.json does not set "rootDir". TypeScript 6 requires it explicitly (error TS5011); add `"rootDir": "./src"` to its "compilerOptions" to keep the dist layout unchanged.');
            }
        }
        return tree;
    };
}
