import { Spectral } from '../../../spectral';
import * as ruleset from '../ruleset.json';

describe('api-servers', () => {
  const s = new Spectral();
  s.addRules({
    // @ts-ignore
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
