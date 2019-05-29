import { readRulesFromRulesets, rulesetsRegistry } from '../reader';

export { commonOasFunctions as oas3Functions } from '../oas';

rulesetsRegistry.set('oas-common', require('../oas/ruleset.json'));

export const rules = async () => readRulesFromRulesets(await import('./ruleset.json'));
