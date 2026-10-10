import { existsSync } from 'fs';
import { dirname, isAbsolute, join, relative } from 'path';
import { CLI_ERRORS } from '../../ui/index.js';
export class TsConfigProvider {
    typescriptLoader;
    constructor(typescriptLoader) {
        this.typescriptLoader = typescriptLoader;
    }
    getByConfigFilename(configFilename) {
        const configPath = join(process.cwd(), configFilename);
        if (!existsSync(configPath)) {
            throw new Error(CLI_ERRORS.MISSING_TYPESCRIPT(configFilename));
        }
        const tsBinary = this.typescriptLoader.load();
        const parsedCmd = tsBinary.getParsedCommandLineOfConfigFile(configPath, undefined, tsBinary.sys);
        if (!parsedCmd) {
            throw new Error(`Could not parse TypeScript configuration file "${configFilename}". Please, ensure that the file contains valid JSON and compiler options.`);
        }
        const { options, fileNames, projectReferences, raw } = parsedCmd;
        const exclude = this.normalizeExclude(this.parseExclude(raw?.exclude), configPath);
        return { options, fileNames, projectReferences, exclude };
    }
    parseExclude(exclude) {
        const passesTypeValidation = Array.isArray(exclude) &&
            exclude.every((item) => typeof item === 'string');
        if (!passesTypeValidation) {
            return [];
        }
        return exclude;
    }
    normalizeExclude(exclude, configPath) {
        const configDir = dirname(configPath);
        const relativeConfigDir = relative(process.cwd(), configDir);
        return exclude.map((pattern) => {
            const normalized = isAbsolute(pattern)
                ? relative(process.cwd(), pattern)
                : join(relativeConfigDir, pattern);
            return normalized.replace(/\\/g, '/');
        });
    }
}
