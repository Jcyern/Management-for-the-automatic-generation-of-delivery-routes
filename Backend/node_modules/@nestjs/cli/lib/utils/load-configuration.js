import { NestConfigurationLoader } from '../configuration/nest-configuration.loader.js';
import { FileSystemReader } from '../readers/index.js';
export async function loadConfiguration() {
    const loader = new NestConfigurationLoader(new FileSystemReader(process.cwd()));
    return loader.load();
}
