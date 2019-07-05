import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../rules.json';

describe('example-value-or-externalValue', () => {
  const s = new Spectral();
  s.addRules({
    'example-value-or-externalValue': Object.assign(ruleset.rules['example-value-or-externalValue'], {
      recommended: true,
      type: RuleType[ruleset.rules['example-value-or-externalValue'].type],
    }),
  });

  test('validate if just externalValue', async () => {
    const results = await s.run({ example: { externalValue: 'value' } });
    expect(results.length).toEqual(0);
  });

  test('validate if just value', async () => {
    const results = await s.run({ example: { value: 'value' } });
    expect(results.length).toEqual(0);
  });

  test('return errors if missing externalValue and value', async () => {
    const results = await s.run({ example: {} });
    expect(results).toMatchSnapshot();
  });

  test('return errors if both externalValue and value', async () => {
    const results = await s.run({ example: { externalValue: 'externalValue', value: 'value' } });
    expect(results).toMatchSnapshot();
  });
});
