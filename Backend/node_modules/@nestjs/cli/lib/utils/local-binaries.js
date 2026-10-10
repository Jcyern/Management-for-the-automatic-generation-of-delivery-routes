import { existsSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
const localBinPathSegments = [process.cwd(), 'node_modules', '@nestjs', 'cli'];
export function localBinExists() {
    return existsSync(join(...localBinPathSegments));
}
export async function loadLocalBinCommandLoader() {
    const commandsPath = join(...localBinPathSegments, 'commands', 'index.js');
    const commandsFile = await import(pathToFileURL(commandsPath).href);
    return commandsFile.CommandLoader;
}
