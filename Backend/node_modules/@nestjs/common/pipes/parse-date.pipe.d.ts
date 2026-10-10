import { PipeTransform } from '../interfaces/features/pipe-transform.interface.js';
import { ErrorHttpStatusCode } from '../utils/http-error-by-code.util.js';
/**
 * @publicApi
 */
export interface ParseDatePipeOptions {
    /**
     * If true, the pipe will return null or undefined if the value is not provided
     * @default false
     */
    optional?: boolean;
    /**
     * A factory whose result is returned when the value is `null` or `undefined`,
     * regardless of `optional`
     */
    default?: () => Date;
    /**
     * The HTTP status code to be used in the response when the validation fails.
     */
    errorHttpStatusCode?: ErrorHttpStatusCode;
    /**
     * A factory function that returns an exception object to be thrown
     * if validation fails.
     * @param error Error message
     * @returns The exception object
     */
    exceptionFactory?: (error: string) => any;
}
/**
 * @publicApi
 */
export declare class ParseDatePipe implements PipeTransform {
    protected readonly options: ParseDatePipeOptions;
    protected exceptionFactory: (error: string) => any;
    constructor(options?: ParseDatePipeOptions);
    /**
     * Method that accesses and performs optional transformation on argument for
     * in-flight requests.
     *
     * @param value currently processed route argument
     * @param metadata contains metadata about the currently processed route argument
     */
    transform(value: unknown): Date | null | undefined;
}
