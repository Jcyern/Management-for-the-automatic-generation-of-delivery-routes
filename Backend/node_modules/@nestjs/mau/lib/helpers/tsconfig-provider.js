"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TsConfigProvider = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
class TsConfigProvider {
    constructor(typescriptLoader) {
        this.typescriptLoader = typescriptLoader;
    }
    getByConfigFilename(configFilename) {
        const configPath = (0, path_1.join)(process.cwd(), configFilename);
        if (!(0, fs_1.existsSync)(configPath)) {
            throw new Error(`Could not find TypeScript configuration file "${configFilename}". Please, ensure that you are running this command in the appropriate directory (inside Nest workspace).`);
        }
        const tsBinary = this.typescriptLoader.load();
        const parsedCmd = tsBinary.getParsedCommandLineOfConfigFile(configPath, undefined, tsBinary.sys);
        const { options, fileNames, projectReferences } = parsedCmd;
        return { options, fileNames, projectReferences };
    }
}
exports.TsConfigProvider = TsConfigProvider;
