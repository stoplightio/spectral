import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('openapi-tags', () => {
  const s = new Spectral();
  s.setRules({
    'openapi-tags': Object.assign(ruleset.rules['openapi-tags'], {
      recommended: true,
      type: RuleType[ruleset.rules['openapi-tags'].type],
    }),
  });

  it('validate an array with a single object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'todos' }],
    });
    expect(results).toHaveLength(0);
  });

  it('validates an array with two alphabetically ordered objects', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'a-tag' }, { name: 'b-tag' }],
    });
    expect(results).toHaveLength(0);
  });

  it('errors when tags is not in alphabetical order', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'b-tag' }, { name: 'a-tag' }],
    });
    expect(results).toEqual([
      {
        code: 'openapi-tags',
        message: 'OpenAPI object should have alphabetical `tags`.',
        path: ['tags'],
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

  it('return errors if missing tags', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
    });
    expect(results).toEqual([
      {
        code: 'openapi-tags',
        message: 'OpenAPI object should have non-empty `tags` array.',
        path: [],
        range: {
          end: {
            character: 13,
            line: 2,
          },
          start: {
            character: 0,
            line: 0,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
