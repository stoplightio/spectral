import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('contact-properties', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['contact-properties']);
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        contact: {
          name: 'stoplight',
          url: 'stoplight.io',
          email: 'support@stoplight.io',
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if name, url, email are missing', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: { contact: {} },
    });
    expect([...results]).toEqual([
      {
        code: 'contact-properties',
        message: 'Contact object should have `name`, `url` and `email`.',
        path: ['info', 'contact'],
        range: {
          end: {
            character: 17,
            line: 4,
          },
          start: {
            character: 14,
            line: 4,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
