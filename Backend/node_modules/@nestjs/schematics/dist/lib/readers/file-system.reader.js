import * as fs from 'fs';
import * as path from 'path';
export class FileSystemReader {
    directory;
    constructor(directory) {
        this.directory = directory;
    }
    list() {
        return fs.promises.readdir(this.directory);
    }
    read(name) {
        return fs.promises.readFile(path.join(this.directory, name), 'utf8');
    }
    readSync(name) {
        return fs.readFileSync(path.join(this.directory, name), 'utf8');
    }
    async readAnyOf(filenames) {
        try {
            for (const file of filenames) {
                return await this.read(file);
            }
        }
        catch {
            return filenames.length > 0
                ? await this.readAnyOf(filenames.slice(1, filenames.length))
                : undefined;
        }
    }
    readSyncAnyOf(filenames) {
        try {
            for (const file of filenames) {
                return this.readSync(file);
            }
        }
        catch {
            return filenames.length > 0
                ? this.readSyncAnyOf(filenames.slice(1, filenames.length))
                : undefined;
        }
    }
}
