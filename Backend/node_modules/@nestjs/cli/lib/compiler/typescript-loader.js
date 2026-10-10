import { createRequire } from 'module';
import { CLI_ERRORS } from '../ui/index.js';
const require = createRequire(import.meta.url);
export class TypeScriptBinaryLoader {
    tsBinary;
    load() {
        if (this.tsBinary) {
            return this.tsBinary;
        }
        let tsBinary;
        try {
            const tsBinaryPath = require.resolve('typescript', {
                paths: [process.cwd(), ...this.getModulePaths()],
            });
            tsBinary = require(tsBinaryPath);
        }
        catch {
            throw new Error('TypeScript could not be found! Please, install "typescript" package.');
        }
        this.assertProgrammaticApiIsSupported(tsBinary);
        this.tsBinary = tsBinary;
        return tsBinary;
    }
    assertProgrammaticApiIsSupported(tsBinary) {
        if (typeof tsBinary.getParsedCommandLineOfConfigFile !== 'function') {
            throw new Error(CLI_ERRORS.UNSUPPORTED_TYPESCRIPT_VERSION(tsBinary.version));
        }
    }
    getModulePaths() {
        const modulePaths = require.resolve.paths('typescript') ?? [];
        const packageDeps = modulePaths.slice(0, 3);
        return [
            ...packageDeps.reverse(),
            ...modulePaths.slice(3, modulePaths.length).reverse(),
        ];
    }
}
