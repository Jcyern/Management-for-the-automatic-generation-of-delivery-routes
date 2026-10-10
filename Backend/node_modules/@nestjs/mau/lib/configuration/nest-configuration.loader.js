"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestConfigurationLoader = void 0;
const chalk = require("chalk");
const logger_1 = require("../helpers/logger");
const readers_1 = require("../readers");
const defaults_1 = require("./defaults");
const loadedConfigsCache = new Map();
class NestConfigurationLoader {
    constructor(reader) {
        this.reader = reader;
    }
    load(name) {
        const cacheEntryKey = `${this.reader.constructor.name}:${name}`;
        const cachedConfig = loadedConfigsCache.get(cacheEntryKey);
        if (cachedConfig) {
            return cachedConfig;
        }
        let loadedConfig;
        const contentOrError = name
            ? this.reader.read(name)
            : this.reader.readAnyOf([
                'nest-cli.json',
                '.nestcli.json',
                '.nest-cli.json',
                'nest.json',
            ]);
        if (contentOrError) {
            const isMissingPersmissionsError = contentOrError instanceof readers_1.ReaderFileLackPersmissionsError;
            if (isMissingPersmissionsError) {
                logger_1.Logger.error(contentOrError.message);
                process.exit(1);
            }
            const fileConfig = JSON.parse(contentOrError);
            if (fileConfig.compilerOptions) {
                loadedConfig = {
                    ...defaults_1.defaultConfiguration,
                    ...fileConfig,
                    compilerOptions: {
                        ...defaults_1.defaultConfiguration.compilerOptions,
                        ...fileConfig.compilerOptions,
                    },
                };
            }
            else {
                logger_1.Logger.log(chalk.blueBright('No "compilerOptions" found in the configuration file. Fallback to the default configuration.'));
                logger_1.Logger.log(chalk.blueBright('If you have a non-standard compilation setup, see "Custom deployment configuration" in the documentation.'));
                loadedConfig = {
                    ...defaults_1.defaultConfiguration,
                    ...fileConfig,
                };
            }
        }
        else {
            logger_1.Logger.log(chalk.blueBright('No configuration file found. Fallback to the default configuration.'));
            logger_1.Logger.log(chalk.blueBright('If you have a non-standard compilation setup, see "Custom deployment configuration" in the documentation.'));
            loadedConfig = defaults_1.defaultConfiguration;
        }
        loadedConfigsCache.set(cacheEntryKey, loadedConfig);
        return loadedConfig;
    }
}
exports.NestConfigurationLoader = NestConfigurationLoader;
