export class ReaderFileLackPermissionsError extends Error {
    filePath;
    fsErrorCode;
    constructor(filePath, fsErrorCode) {
        super(`File ${filePath} lacks read permissions!`);
        this.filePath = filePath;
        this.fsErrorCode = fsErrorCode;
    }
}
