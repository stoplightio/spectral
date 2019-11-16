import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('oas2-host-not-example', () => {
  const s = new Spectral();
  s.registerFormat('oas2', () => true);
  s.setRules({
    'oas2-host-not-example': Object.assign(ruleset.rules['oas2-host-not-example'], {
      recommended: true,
      type: RuleType[ruleset.rules['oas2-host-not-example'].type],
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
        code: 'oas2-host-not-example',
        message: 'Host URL should not point at example.com.',
        path: ['host'],
      }),
    ]);
  });
});
