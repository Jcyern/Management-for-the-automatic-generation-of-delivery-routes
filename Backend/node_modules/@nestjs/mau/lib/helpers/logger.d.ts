export declare const ERROR_PREFIX: string;
export declare class Logger {
    static log(...args: any[]): void;
    static error(...args: any[]): void;
    static raw(...args: any[]): void;
    static newLine(): void;
}
