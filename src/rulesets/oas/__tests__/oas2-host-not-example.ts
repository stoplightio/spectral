import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('oas2-host-not-example', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['oas2-host-not-example']);
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
    expect([...results]).toEqual([
      expect.objectContaining({
        code: 'oas2-host-not-example',
        message: 'Host URL should not point at example.com.',
        path: ['host'],
      }),
    ]);
  });
});
