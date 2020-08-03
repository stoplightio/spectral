import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('path-not-include-query', () => {
  const s = new Spectral();
  s.setRules({
    'path-not-include-query': Object.assign(ruleset.rules['path-not-include-query'], {
      recommended: true,
      type: RuleType[ruleset.rules['path-not-include-query'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: { '/path': {} },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if includes a query', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: { '/path?query=true': {} },
    });
    expect(results).toEqual([
      {
        code: 'path-not-include-query',
        message: 'given keys should not include a query string.',
        path: ['paths', '/path?query=true'],
        resolvedPath: ['paths', '/path?query=true'],
        range: {
          end: {
            character: 26,
            line: 3,
          },
          start: {
            character: 23,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
