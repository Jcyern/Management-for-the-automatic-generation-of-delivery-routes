export declare const DEFAULT_IMAGE = "node:24.18.0-bookworm-slim";
export declare const DEFAULT_ENTRY_FILE = "dist/main.js";
export declare class InlineApplicationDockerfileFactory {
    static create(options: {
        image?: string;
        applicationName?: string;
        entryFile?: string;
        cpuArchitecture?: 'X86_64' | 'arm64';
    }): string;
}
