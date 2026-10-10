import { IRouteParamsFactory } from './interfaces/route-params-factory.interface.js';
import { RouteParamtypes } from '@nestjs/common/internal';
import type { ApplicationConfig } from '../application-config.js';
export declare class RouteParamsFactory implements IRouteParamsFactory {
    private readonly config?;
    constructor(config?: ApplicationConfig | undefined);
    exchangeKeyForValue<TRequest extends Record<string, any> = any, TResponse = any, TResult = any>(key: RouteParamtypes | string, data: string, { req, res, next }: {
        req: TRequest;
        res: TResponse;
        next: Function;
    }): TResult | null;
}
