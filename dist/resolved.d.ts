import { IResolveError, IResolveResult, IResolveRunner } from '@stoplight/json-ref-resolver/dist/types';
import { Dictionary, ILocation, JsonPath } from '@stoplight/types';
import { IParseMap } from './spectral';
import { IParsedResult } from './types';
export declare class Resolved implements IResolveResult {
    spec: IParsedResult;
    parsedMap: IParseMap;
    refMap: Dictionary<string>;
    result: unknown;
    errors: IResolveError[];
    runner: IResolveRunner;
    constructor(spec: IParsedResult, result: IResolveResult, parsedMap: IParseMap);
    getParsedForJsonPath(path: JsonPath): {
        path: any[];
        doc: IParsedResult<import("@stoplight/types").IParserResult<unknown, any, any, any>>;
    };
    getLocationForJsonPath(path: JsonPath, closest?: boolean): ILocation;
}
