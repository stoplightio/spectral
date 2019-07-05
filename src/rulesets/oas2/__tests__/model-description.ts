import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('model-description', () => {
  const s = new Spectral();
  s.addRules({
    'model-description': Object.assign(ruleset.rules['model-description'], {
      recommended: true,
      type: RuleType[ruleset.rules['model-description'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      host: 'stoplight.io',
      definitions: {
        user: {
          description: 'this describes the user model',
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if a definition is missing description', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      host: 'stoplight.io',
      definitions: { user: {} },
    });
    expect(results).toEqual([
      {
        code: 'model-description',
        message: 'Definition `description` must be present and non-empty string.',
        path: ['definitions', 'user', 'description'],
        range: {
          end: {
            character: 14,
            line: 5,
          },
          start: {
            character: 11,
            line: 5,
          },
        },
        severity: DiagnosticSeverity.Warning,
        summary: 'Definition `description` must be present and non-empty string.',
      },
    ]);
  });
});
