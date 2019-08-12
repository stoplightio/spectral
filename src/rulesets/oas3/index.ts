import { readRuleset } from '../reader';

export { commonOasFunctions as oas3Functions } from '../oas';

export const rules = async () => (await readRuleset(require.resolve('./index.json'))).rules;
