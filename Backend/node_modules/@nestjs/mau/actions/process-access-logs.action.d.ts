export declare class ProcessAccessLogsAction {
    handle(options: {
        outputFile: string | undefined;
        ignoreMauEnvVars: boolean;
    }): Promise<void>;
    askForMissingInformation(options: {
        ignoreMauEnvVars: boolean;
    }): Promise<{
        apiKey: string | undefined;
        apiSecret: string | undefined;
    }>;
}
