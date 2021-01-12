import { Spectral } from '../../../spectral';
import { loadRules } from './__helpers__/loadRules';
import { DiagnosticSeverity } from '@stoplight/types';

const ruleName = 'asyncapi-server-not-example-com';

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

  test('return result if {server}.url property is set to `example.com`', async () => {
    doc.servers.production.url = 'example.com';

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Server URL should not point at example.com.',
        path: ['servers', 'production', 'url'],
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });
});
