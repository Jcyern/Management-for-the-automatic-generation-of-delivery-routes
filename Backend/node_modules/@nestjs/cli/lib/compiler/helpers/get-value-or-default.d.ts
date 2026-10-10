import { Configuration } from '../../configuration/index.js';
export declare function getValueOrDefault<T = any>(configuration: Required<Configuration>, propertyPath: string, appName: string | undefined, key?: 'path' | 'webpack' | 'webpackPath' | 'entryFile' | 'sourceRoot' | 'exec' | 'builder' | 'typeCheck' | 'emitDeclarations', options?: Record<string, any>, defaultValue?: T): T;
export declare function getValueOfPath<T = any>(object: Record<string, any>, propertyPath: string): T;
