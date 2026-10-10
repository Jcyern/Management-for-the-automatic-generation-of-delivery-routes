import { AbstractRunner } from './abstract.runner';
export declare class DockerRunner extends AbstractRunner {
    constructor();
    build(tag: string, options?: {
        buildx?: boolean;
        dockerfilePath?: string;
        inlineDockerfile?: string;
        dockerFlags: {
            target?: string;
            buildArgs?: string[];
            noCache?: boolean;
            platform?: string;
        };
    }): Promise<void>;
    login(username: string, password: string, registry: string): Promise<void>;
    push(tag: string): Promise<void>;
    private getBuildCommandWithFlags;
}
