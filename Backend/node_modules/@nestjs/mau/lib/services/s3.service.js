"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = exports.TimeRange = void 0;
const chalk = require("chalk");
const fs_1 = require("fs");
const readline = require("readline");
const util_1 = require("util");
const zlib = require("zlib");
const logger_1 = require("../helpers/logger");
var TimeRange;
(function (TimeRange) {
    TimeRange["TODAY"] = "LAST_24_HOURS";
    TimeRange["LAST_3_DAYS"] = "LAST_3_DAYS";
    TimeRange["LAST_7_DAYS"] = "LAST_7_DAYS";
    TimeRange["LAST_30_DAYS"] = "LAST_30_DAYS";
})(TimeRange || (exports.TimeRange = TimeRange = {}));
class S3Service {
    constructor() {
        this.initialized = false;
    }
    async initialize(region, credentials) {
        this.s3Package = await Promise.resolve().then(() => require('@aws-sdk/client-s3')).catch(() => {
            logger_1.Logger.error(`Failed to import AWS S3 package. Please, make sure that you have the ${chalk.red('@aws-sdk/client-s3')} package installed.`);
            logger_1.Logger.error("Install it using your package manager and try again. For example, 'npm install @aws-sdk/client-s3'.");
            process.exit(1);
        });
        this.s3Client = new this.s3Package.S3Client({
            region,
            credentials: {
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
                sessionToken: credentials.sessionToken,
            },
        });
        this.initialized = true;
    }
    async pullAllAndSave(bucketName, timeRange, pathPrefix, outputFilePath, hooks) {
        if (!this.initialized) {
            throw new Error('Service not initialized');
        }
        const logFiles = await this.listFiles(bucketName, timeRange);
        if (!logFiles || logFiles.length === 0) {
            throw new Error('No access log files found');
        }
        hooks.onStart(logFiles.length);
        const outputStream = (0, fs_1.createWriteStream)(outputFilePath);
        outputStream.on('error', (err) => hooks.onError(err));
        const write = (0, util_1.promisify)(outputStream.write).bind(outputStream);
        await write('[');
        let isFirstLog = true;
        for (let i = 0; i < logFiles.length; i++) {
            await this.downloadFileAndAppendToStream(bucketName, logFiles[i], outputStream, {
                isFirstLog,
                onFirstLog: () => (isFirstLog = false),
                pathPrefix,
            });
            hooks.onProgress(i + 1);
        }
        await write(']');
        outputStream.end();
    }
    async listFiles(bucketName, timeRange) {
        let isTruncated = true;
        let continuationToken = undefined;
        const logFiles = [];
        while (isTruncated) {
            const command = new this.s3Package.ListObjectsV2Command({
                Bucket: bucketName,
                ContinuationToken: continuationToken,
            });
            const response = await this.s3Client.send(command);
            const objects = response.Contents;
            if (objects) {
                for (const obj of objects) {
                    if (!obj.Key) {
                        continue;
                    }
                    if (!obj.Key.endsWith('.log.gz')) {
                        continue;
                    }
                    logFiles.push(obj.Key);
                }
            }
            isTruncated = response.IsTruncated || false;
            continuationToken = response.NextContinuationToken;
        }
        const now = new Date();
        return logFiles.filter((logFile) => {
            const parts = logFile.split('/');
            const year = parseInt(parts[4]);
            const month = parseInt(parts[5]);
            const day = parseInt(parts[6]);
            const logDate = new Date(year, month - 1, day);
            switch (timeRange) {
                case TimeRange.TODAY:
                    return now.getTime() - logDate.getTime() < 24 * 60 * 60 * 1000;
                case TimeRange.LAST_3_DAYS:
                    return now.getTime() - logDate.getTime() < 3 * 24 * 60 * 60 * 1000;
                case TimeRange.LAST_7_DAYS:
                    return now.getTime() - logDate.getTime() < 7 * 24 * 60 * 60 * 1000;
                case TimeRange.LAST_30_DAYS:
                    return now.getTime() - logDate.getTime() < 30 * 24 * 60 * 60 * 1000;
                default:
                    return false;
            }
        });
    }
    async downloadFileAndAppendToStream(bucketName, key, writeStream, opts) {
        const command = new this.s3Package.GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });
        const response = await this.s3Client.send(command);
        if (response.Body) {
            const gunzipStream = zlib.createGunzip();
            const rl = readline.createInterface({
                input: response.Body.pipe(gunzipStream),
                crlfDelay: Infinity,
            });
            const promisifyWriteStream = (0, util_1.promisify)(writeStream.write).bind(writeStream);
            for await (const line of rl) {
                try {
                    const logJson = this.parseLogLineToJSON(line);
                    if (!logJson) {
                        continue;
                    }
                    if (opts.pathPrefix && !logJson.url.startsWith(opts.pathPrefix)) {
                        continue;
                    }
                    const prefix = opts.isFirstLog ? '' : ',\n';
                    await promisifyWriteStream(prefix + JSON.stringify(logJson));
                    if (opts.isFirstLog) {
                        opts.onFirstLog();
                        opts.isFirstLog = false;
                    }
                }
                catch {
                    continue;
                }
            }
        }
    }
    parseLogLineToJSON(logLine) {
        const logParts = logLine.split(' ');
        if (logParts.length < 19) {
            return;
        }
        const requestProcessingTime = parseFloat(logParts[5]);
        const targetProcessingTime = parseFloat(logParts[6]);
        const responseProcessingTime = parseFloat(logParts[7]);
        if (targetProcessingTime === -1) {
            return;
        }
        const processingTime = requestProcessingTime + targetProcessingTime + responseProcessingTime;
        const parsedLog = {
            type: logParts[0],
            timestamp: logParts[1],
            clientIp: logParts[3].split(':')[0],
            processingTime: processingTime,
            statusCode: parseInt(logParts[8]),
            receivedBytes: parseInt(logParts[10]),
            sentBytes: parseInt(logParts[11]),
            method: logParts[12] ? logParts[12].replace(/\"/g, '') : '',
            url: logParts[13]
                ? new URL(logParts[13].replace(/\"/g, '')).pathname
                : '',
            httpVersion: logParts[14] ? logParts[14].replace(/\"/g, '') : '',
        };
        return parsedLog;
    }
}
exports.S3Service = S3Service;
