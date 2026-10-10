/// <reference types="node" />
import { WriteStream } from 'fs';
import { RequestLog } from '../interfaces/request-log.interface';
export declare enum TimeRange {
    TODAY = "LAST_24_HOURS",
    LAST_3_DAYS = "LAST_3_DAYS",
    LAST_7_DAYS = "LAST_7_DAYS",
    LAST_30_DAYS = "LAST_30_DAYS"
}
export declare class S3Service {
    private initialized;
    private s3Package;
    private s3Client;
    initialize(region: string, credentials: {
        accessKeyId: string;
        secretAccessKey: string;
        sessionToken: string;
    }): Promise<void>;
    pullAllAndSave(bucketName: string, timeRange: TimeRange, pathPrefix: string | undefined, outputFilePath: string, hooks: {
        onStart: (total: number) => void;
        onProgress: (progress: number) => void;
        onError: (err: Error) => void;
    }): Promise<void>;
    listFiles(bucketName: string, timeRange: TimeRange): Promise<string[]>;
    downloadFileAndAppendToStream(bucketName: string, key: string, writeStream: WriteStream, opts: {
        isFirstLog: boolean;
        onFirstLog: () => void;
        pathPrefix: string | undefined;
    }): Promise<void>;
    parseLogLineToJSON(logLine: string): RequestLog | undefined;
}
