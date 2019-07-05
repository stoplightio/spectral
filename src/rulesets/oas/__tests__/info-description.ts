import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('info-description', () => {
  const s = new Spectral();
  s.addRules({
    'info-description': Object.assign(ruleset.rules['info-description'], {
      recommended: true,
      type: RuleType[ruleset.rules['info-description'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: { contact: { name: 'stoplight.io' }, description: 'description' },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if info missing description', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: { contact: { name: 'stoplight.io' } },
    });
    expect(results).toEqual([
      {
        code: 'info-description',
        message: 'OpenAPI object info `description` must be present and non-empty string.',
        path: ['info', 'description'],
        range: {
          end: {
            character: 28,
            line: 5,
          },
          start: {
            character: 9,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
