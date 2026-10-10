import { Configuration } from '../lib/configuration';
import { TsConfigProvider } from '../lib/helpers/tsconfig-provider';
import { TypeScriptBinaryLoader } from '../lib/helpers/typescript-loader';
export type DeployActionOptions = {
    name?: string;
    dockerfile?: string;
    image?: string;
    waitForServiceStability?: boolean;
    ignoreMauEnvVars: boolean;
    hash: string | undefined;
    onConflict: 'abort' | 'bump';
    entryFile?: string;
    dockerFlags: {
        target?: string;
        buildArgs?: string[];
        noCache?: boolean;
        platform?: string;
    };
};
export declare class DeployAction {
    protected readonly tsLoader: TypeScriptBinaryLoader;
    protected readonly tsConfigProvider: TsConfigProvider;
    handle(options: DeployActionOptions): Promise<void>;
    assertRootDirectory(): void;
    askForMissingInformation(options: DeployActionOptions, context: {
        projectConfiguration: Readonly<Configuration>;
    }): Promise<{
        apiKey: string | undefined;
        apiSecret: string | undefined;
        name: string | undefined;
    }>;
    private assertCustomDockerfileExists;
    private ensureDockerignoreExists;
    private extractUsernameAndPassword;
    private fileExists;
    private getCompiledEntryFilePath;
    private waitForDeploymentToComplete;
}
