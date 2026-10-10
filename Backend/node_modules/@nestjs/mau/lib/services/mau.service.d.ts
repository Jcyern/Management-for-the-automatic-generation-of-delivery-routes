import { Dispatcher } from 'undici';
type EntityTask = {
    arn: string;
    startedAt: Date;
};
export interface SessionCredentials {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
    expiration: Date;
}
export interface InitializeSessionPayload {
    clusterName: string;
    containerName: string;
    region: string;
    tasks: Array<EntityTask>;
    credentials: SessionCredentials;
}
export interface AccessLogsSessionPayload {
    bucketName: string;
    applicationName: string;
    pathPrefix: string | undefined;
    region: string;
    credentials: SessionCredentials;
}
export declare class MauService {
    static initializeDeployment(apiKey: string, apiSecret: string): Promise<{
        registryUri: string;
        uniqueTag: string;
        nextVersion: string;
        registryAuthToken: string;
        timestamp: number;
        cpuArchitecture: 'X86_64' | 'arm64';
    }>;
    static finalizeDeployment(apiKey: string, apiSecret: string, payload: {
        uri: string;
        version: string;
        waitForServiceStable: boolean | undefined;
        hash: string | undefined;
        onConflict: 'abort' | 'bump';
    }): Promise<{
        message: string;
        version: string;
        deploymentId?: string;
        jobId?: string;
    } | {
        error: string;
    }>;
    static verifyDeploymentStatus(apiKey: string, apiSecret: string, payload: {
        deploymentId: string;
        jobId: string;
    }): Promise<{
        status: string;
        inProgress: boolean;
    }>;
    static initializeSshSession(apiKey: string, apiSecret: string): Promise<InitializeSessionPayload>;
    static initializeAccessLogsSession(apiKey: string, apiSecret: string): Promise<AccessLogsSessionPayload>;
    static toJSON(res: Dispatcher.ResponseData): Promise<any>;
}
export {};
