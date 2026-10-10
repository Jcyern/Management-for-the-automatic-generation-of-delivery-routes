import { AbstractRunner } from './abstract.runner';
export declare class AwsRunner extends AbstractRunner {
    constructor(credentials: {
        accessKeyId: string;
        secretAccessKey: string;
        sessionToken: string;
    });
    executeCommand(options: {
        region: string;
        cluster: string;
        task: string;
        container: string;
        command: string;
    }): Promise<void>;
}
