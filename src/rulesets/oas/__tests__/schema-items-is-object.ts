import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('schema-items-is-object', () => {
  const s = new Spectral();
  s.addRules({
    'schema-items-is-object': Object.assign(ruleset.rules['schema-items-is-object'], {
      enabled: true,
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      schema: { items: { type: 'string' } },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if items is undefined', async () => {
    const results = await s.run({
      schema: { items: undefined },
    });

    expect(results).toMatchSnapshot();
  });

  test('return errors if items is not an object', async () => {
    const results = await s.run({
      schema: { items: 'string' },
    });
    expect(results).toMatchSnapshot();
  });
});
