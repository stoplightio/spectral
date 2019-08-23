import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('host-not-example', () => {
  const s = new Spectral();
  s.setRules({
    'host-not-example': Object.assign(ruleset.rules['host-not-example'], {
      recommended: true,
      type: RuleType[ruleset.rules['host-not-example'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      host: 'stoplight.io',
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if server is example.com', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      host: 'https://example.com',
    });
    expect(results).toEqual([
      expect.objectContaining({
        code: 'host-not-example',
        message: 'Server URL should not point at `example.com`.',
        path: ['host'],
      }),
    ]);
  });
});
