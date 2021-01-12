import type { Spectral } from '../../../spectral';
import { DiagnosticSeverity } from '@stoplight/types';
import { loadRules } from './__helpers__/loadRules';

const ruleName = 'asyncapi-server-no-trailing-slash';

describe(`Rule '${ruleName}'`, () => {
  let s: Spectral;
  let doc: any;

  beforeEach(async () => {
    s = await loadRules([ruleName]);

    doc = {
      asyncapi: '2.0.0',
      servers: {
        production: {
          url: 'stoplight.io',
          protocol: 'https',
        },
      },
    };
  });

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if {server}.url property ends with a trailing slash', async () => {
    doc.servers.production.url = 'stoplight.io/';

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Server URL should not end with a slash.',
        path: ['servers', 'production', 'url'],
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });
});
