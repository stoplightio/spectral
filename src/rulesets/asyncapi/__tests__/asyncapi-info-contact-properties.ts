import type { Spectral } from '../../../spectral';
import { loadRules } from './__helpers__/loadRules';
import { DiagnosticSeverity } from '@stoplight/types';

const ruleName = 'asyncapi-info-contact-properties';

describe(`Rule '${ruleName}'`, () => {
  let s: Spectral;
  let doc: any;

  beforeEach(async () => {
    s = await loadRules([ruleName]);

    doc = {
      asyncapi: '2.0.0',
      info: {
        contact: {
          name: 'stoplight',
          url: 'stoplight.io',
          email: 'support@stoplight.io',
        },
      },
    };
  });

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test.each(['name', 'url', 'email'])('return result if contact.%s property is missing', async (property: string) => {
    delete doc.info.contact[property];

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Contact object should have `name`, `url` and `email`.',
        path: ['info', 'contact'],
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });
});
