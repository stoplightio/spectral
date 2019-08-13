import { Resolved } from './resolved';
import { IFunction, IGivenNode, IRuleResult, IRunRule, IThen } from './types';
export declare const lintNode: (node: IGivenNode, rule: IRunRule, then: IThen<string, any>, apply: IFunction<any>, resolved: Resolved) => IRuleResult[];
export declare const whatShouldBeLinted: (path: (string | number)[], originalValue: any, rule: IRunRule) => {
    lint: boolean;
    value: any;
};
