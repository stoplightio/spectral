import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('operation-description', () => {
  const s = new Spectral();
  s.addRules({
    'operation-description': Object.assign(ruleset.rules['operation-description'], {
      recommended: true,
      type: RuleType[ruleset.rules['operation-description'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            description: 'some-description',
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if operation description is missing', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {},
        },
      },
    });
    expect(results).toEqual([
      {
        code: 'operation-description',
        message: 'Operation `description` must be present and non-empty string.',
        path: ['paths', '/todos', 'get'],
        range: {
          end: {
            character: 15,
            line: 4,
          },
          start: {
            character: 12,
            line: 4,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('does not get called on parameters', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          parameters: [],
        },
      },
    });
    expect(results).toEqual([]);
  });
});
