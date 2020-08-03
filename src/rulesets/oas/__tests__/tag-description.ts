import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('tag-description', () => {
  const s = new Spectral();
  s.setRules({
    'tag-description': Object.assign(ruleset.rules['tag-description'], {
      recommended: true,
      type: RuleType[ruleset.rules['tag-description'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'tag', description: 'some-description' }],
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if tag has no description', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'tag' }],
    });
    expect(results).toEqual([
      {
        code: 'tag-description',
        message: 'Tag object should have a `description`.',
        path: ['tags', '0'],
        resolvedPath: ['tags', '0', 'description'],
        range: {
          end: {
            character: 19,
            line: 5,
          },
          start: {
            character: 4,
            line: 4,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
