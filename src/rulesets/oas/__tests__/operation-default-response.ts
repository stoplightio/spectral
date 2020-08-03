import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('operation-default-response', () => {
  const s = new Spectral();
  s.setRules({
    'operation-default-response': Object.assign(ruleset.rules['operation-default-response'], {
      recommended: true,
      type: RuleType[ruleset.rules['operation-default-response'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/path': {
          '/get': {
            responses: {
              default: {},
            },
          },
        },
      },
    });
    expect(results).toHaveLength(0);
  });

  test('return errors if path-responses is missing default', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/path': {
          '/get': {
            responses: {
              '2xx': {},
            },
          },
        },
      },
    });
    expect(results).toEqual([
      {
        code: 'operation-default-response',
        message: 'Operations must have a default response.',
        path: ['paths', '/path', '/get', 'responses'],
        resolvedPath: ['paths', '/path', '/get', 'responses', 'default'],
        range: {
          end: {
            character: 19,
            line: 6,
          },
          start: {
            character: 20,
            line: 5,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
