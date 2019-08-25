import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('contact-properties', () => {
  const s = new Spectral();
  s.setRules({
    'contact-properties': Object.assign(ruleset.rules['contact-properties'], {
      recommended: true,
      type: RuleType[ruleset.rules['contact-properties'].type],
    }),
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
    expect(results).toEqual([
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
        severity: 1,
        source: undefined,
      },
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
