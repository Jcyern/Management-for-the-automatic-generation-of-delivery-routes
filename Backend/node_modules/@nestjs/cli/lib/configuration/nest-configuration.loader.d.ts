import { Reader } from '../readers/index.js';
import { Configuration } from './configuration.js';
import { ConfigurationLoader } from './configuration.loader.js';
export declare class NestConfigurationLoader implements ConfigurationLoader {
    private readonly reader;
    constructor(reader: Reader);
    load(name?: string): Required<Configuration>;
}
