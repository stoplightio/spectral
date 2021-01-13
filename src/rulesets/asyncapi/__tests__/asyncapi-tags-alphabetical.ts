import type { Spectral } from '../../../spectral';
import { DiagnosticSeverity } from '@stoplight/types';
import { createWithRules } from './__helpers__/createWithRules';

const ruleName = 'asyncapi-tags-alphabetical';

describe(`Rule '${ruleName}'`, () => {
  let s: Spectral;
  let doc: any;

  beforeEach(async () => {
    s = await createWithRules([ruleName]);

    doc = {
      asyncapi: '2.0.0',
      tags: [{ name: 'a tag' }, { name: 'another tag' }],
    };
  });

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if tags are not sorted', async () => {
    doc.tags = [{ name: 'wrongly ordered' }, ...doc.tags];

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'AsyncAPI object should have alphabetical `tags`.',
        path: ['tags'],
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });
});
