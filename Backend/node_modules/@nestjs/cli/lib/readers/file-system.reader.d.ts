import { Reader, ReaderFileLackPermissionsError } from './reader.js';
export declare class FileSystemReader implements Reader {
    private readonly directory;
    constructor(directory: string);
    list(): string[];
    read(name: string): string;
    readAnyOf(filenames: string[]): string | undefined | ReaderFileLackPermissionsError;
}
