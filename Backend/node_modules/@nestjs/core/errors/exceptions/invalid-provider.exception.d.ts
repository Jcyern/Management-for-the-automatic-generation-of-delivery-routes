import { InjectorDependency } from '../../injector/injector.js';
import { RuntimeException } from './runtime.exception.js';
export declare class InvalidProviderException extends RuntimeException {
    constructor(token: InjectorDependency, moduleName: string);
}
