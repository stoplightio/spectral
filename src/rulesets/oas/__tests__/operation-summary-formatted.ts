import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('operation-summary-formatted', () => {
  const s = new Spectral();
  s.addRules({
    'operation-summary-formatted': Object.assign(ruleset.rules['operation-summary-formatted'], {
      recommended: true,
      type: RuleType[ruleset.rules['operation-summary-formatted'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            summary: 'This is a valid summary.',
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if summary does not start with an uppercase', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            summary: 'this is not a valid summary.',
          },
        },
      },
    });
    expect(results).toEqual([
      {
        code: 'operation-summary-formatted',
        message: 'Operation `summary` should start with upper case and end with a dot.',
        path: ['paths', '/todos', 'get', 'summary'],
        range: {
          end: {
            character: 49,
            line: 5,
          },
          start: {
            character: 19,
            line: 5,
          },
        },
        severity: DiagnosticSeverity.Warning,
        summary: 'Operation `summary` should start with upper case and end with a dot.',
      },
    ]);
  });

  test('return errors if summary does not end with a dot', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            summary: 'This is not a valid summary',
          },
        },
      },
    });
    expect(results).toEqual([
      {
        code: 'operation-summary-formatted',
        message: 'Operation `summary` should start with upper case and end with a dot.',
        path: ['paths', '/todos', 'get', 'summary'],
        range: {
          end: {
            character: 48,
            line: 5,
          },
          start: {
            character: 19,
            line: 5,
          },
        },
        severity: DiagnosticSeverity.Warning,
        summary: 'Operation `summary` should start with upper case and end with a dot.',
      },
    ]);
  });
});
