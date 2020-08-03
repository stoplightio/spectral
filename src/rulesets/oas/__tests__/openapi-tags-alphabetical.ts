import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('openapi-tags-alphabetical', () => {
  const s = new Spectral();
  s.setRules({
    'openapi-tags-alphabetical': Object.assign(ruleset.rules['openapi-tags-alphabetical'], {
      recommended: true,
      type: RuleType[ruleset.rules['openapi-tags-alphabetical'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'a-tag' }, { name: 'b-tag' }],
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if tags is not in alphabetical order', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'b-tag' }, { name: 'a-tag' }],
    });
    expect(results).toEqual([
      {
        code: 'openapi-tags-alphabetical',
        message: 'OpenAPI object should have alphabetical `tags`.',
        path: ['tags'],
        resolvedPath: ['tags'],
        range: {
          end: {
            character: 21,
            line: 8,
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
