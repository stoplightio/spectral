import { readRulesFromRulesets } from '../reader';

export { commonOasFunctions as oas2Functions } from '../oas';

export const rules = async () => readRulesFromRulesets(require.resolve('./rules.json'));
