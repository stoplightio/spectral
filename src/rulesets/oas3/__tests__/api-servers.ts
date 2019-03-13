import { Spectral } from '../../../spectral';
import { oas3Rules } from '../index';

const ruleset = { rules: oas3Rules() };

describe('api-servers', () => {
  const s = new Spectral();
  s.addRules({
    'api-servers': Object.assign(ruleset.rules['api-servers'], {
      enabled: true,
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      paths: {},
      servers: [{ url: 'https://stoplight.io' }],
    });
    expect(results.results.length).toEqual(0);
  });

  test('return errors if servers is missing ', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      paths: {},
    });
    expect(results.results).toMatchSnapshot();
  });

  test('return errors if servers is an empty array ', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      paths: {},
      servers: [],
    });
    expect(results.results).toMatchSnapshot();
  });
});
