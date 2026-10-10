import * as fs from 'fs';
import * as path from 'path';
import { ReaderFileLackPermissionsError } from './reader.js';
export class FileSystemReader {
    directory;
    constructor(directory) {
        this.directory = directory;
    }
    list() {
        return fs.readdirSync(this.directory);
    }
    read(name) {
        return fs.readFileSync(path.join(this.directory, name), 'utf8');
    }
    readAnyOf(filenames) {
        let firstFilePathFoundButWithInsufficientPermissions;
        for (let id = 0; id < filenames.length; id++) {
            const file = filenames[id];
            try {
                return this.read(file);
            }
            catch (readErr) {
                if (!firstFilePathFoundButWithInsufficientPermissions &&
                    typeof readErr?.code === 'string') {
                    const isInsufficientPermissionsError = readErr.code === 'EACCES' || readErr.code === 'EPERM';
                    if (isInsufficientPermissionsError) {
                        firstFilePathFoundButWithInsufficientPermissions = readErr.path;
                    }
                }
                const isLastFileToLookFor = id === filenames.length - 1;
                if (!isLastFileToLookFor) {
                    continue;
                }
                if (firstFilePathFoundButWithInsufficientPermissions) {
                    return new ReaderFileLackPermissionsError(firstFilePathFoundButWithInsufficientPermissions, readErr.code);
                }
                else {
                    return undefined;
                }
            }
        }
    }
}
