import { ruleSchema } from '../ruleSchema';
import { schemaToRuleCollection } from '../schemaToRuleCollection';

describe('convert rule schema to ruleset', () => {
  it('should generate a collection of rules automatically', () => {
    expect(schemaToRuleCollection(ruleSchema)).toMatchSnapshot();
  });
});
