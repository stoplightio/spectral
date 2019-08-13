import { Dictionary } from '@stoplight/types';
import { FunctionCollection, IConstructorOpts, IParsedResult, IRuleResult, IRunOpts, PartialRuleCollection, RuleCollection, RuleDeclarationCollection, RunRuleCollection } from './types';
export * from './types';
export declare class Spectral {
    private _rules;
    private _functions;
    private _resolver;
    constructor(opts?: IConstructorOpts);
    run(target: IParsedResult | object | string, opts?: IRunOpts): Promise<IRuleResult[]>;
    readonly functions: FunctionCollection;
    addFunctions(functions: FunctionCollection): void;
    readonly rules: RunRuleCollection;
    addRules(rules: RuleCollection): void;
    mergeRules(rules: PartialRuleCollection): void;
    applyRuleDeclarations(declarations: RuleDeclarationCollection): void;
    private _parsedMap;
    private _processExternalRef;
}
export declare const REF_METADATA: unique symbol;
export declare const isParsedResult: (obj: any) => obj is IParsedResult<import("@stoplight/types").IParserResult<unknown, any, any, any>>;
export interface IParseMap {
    refs: Dictionary<object>;
    parsed: Dictionary<IParsedResult>;
    pointers: Dictionary<string[]>;
}
