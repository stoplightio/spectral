import { RuleCollection } from '../../types';
import { ruleSchema } from './ruleSchema';
import { schemaToRuleCollection } from './schemaToRuleCollection';

export const spectralRules = (): RuleCollection => schemaToRuleCollection(ruleSchema);
