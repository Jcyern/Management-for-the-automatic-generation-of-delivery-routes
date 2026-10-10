export declare class SshAction {
    handle(options: {
        command: string;
        ignoreMauEnvVars: boolean;
    }): Promise<void>;
    askForMissingInformation(options: {
        ignoreMauEnvVars: boolean;
    }): Promise<{
        apiKey: string | undefined;
        apiSecret: string | undefined;
    }>;
}
