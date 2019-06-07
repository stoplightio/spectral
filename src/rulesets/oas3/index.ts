import { resolve } from 'path';
import { readRulesFromRulesets } from '../reader';

export { commonOasFunctions as oas3Functions } from '../oas';

export const rules = async () => {
  return readRulesFromRulesets(resolve(__dirname, 'ruleset.json'));
};
