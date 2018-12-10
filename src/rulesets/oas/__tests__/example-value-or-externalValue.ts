import { Spectral } from '../../../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('example-value-or-externalValue', () => {
  const s = new Spectral();
  s.addRules({
    'example-value-or-externalValue': Object.assign(ruleset.rules['example-value-or-externalValue'], {
      enabled: true,
    }),
  });

  test('validate if just externalValue', () => {
    const results = s.run({ example: { externalValue: 'value' } });
    expect(results.results.length).toEqual(0);
  });

  test('validate if just value', () => {
    const results = s.run({ example: { value: 'value' } });
    expect(results.results.length).toEqual(0);
  });

  test('return errors if missing externalValue and value', () => {
    const results = s.run({ example: {} });
    expect(results.results.length).toEqual(1);
  });

  test('return errors if both externalValue and value', () => {
    const results = s.run({ example: { externalValue: 'externalValue', value: 'value' } });
    expect(results.results.length).toEqual(1);
  });
});
