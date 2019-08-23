import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('operation-tags', () => {
  const s = new Spectral();
  s.setRules({
    'operation-tags': Object.assign(ruleset.rules['operation-tags'], {
      recommended: true,
      type: RuleType[ruleset.rules['operation-tags'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            tags: [{ name: 'todos' }],
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if tags is missing', async () => {
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
        code: 'operation-tags',
        message: 'Operation should have non-empty `tags` array.',
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
});
