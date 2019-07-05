import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('api-servers', () => {
  const s = new Spectral();
  s.addRules({
    'api-servers': Object.assign(ruleset.rules['api-servers'], {
      recommended: true,
      type: RuleType[ruleset.rules['api-servers'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      paths: {},
      servers: [{ url: 'https://stoplight.io' }],
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if servers is missing ', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      paths: {},
    });
    expect(results).toMatchSnapshot();
  });

  test('return errors if servers is an empty array ', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      paths: {},
      servers: [],
    });
    expect(results).toMatchSnapshot();
  });
});
