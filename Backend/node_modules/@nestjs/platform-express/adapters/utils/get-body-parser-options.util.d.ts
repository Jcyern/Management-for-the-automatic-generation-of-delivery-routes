import type { NestExpressBodyParserOptionsFor, NestExpressBodyParserOptionsMap, NestExpressBodyParserType } from '../../interfaces/index.js';
export declare function getBodyParserOptions<ParserType extends NestExpressBodyParserType>(parser: ParserType, rawBody: boolean, options?: NestExpressBodyParserOptionsFor<ParserType>): NestExpressBodyParserOptionsMap[ParserType];
