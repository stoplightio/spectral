import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';
import { DiagnosticSeverity } from '@stoplight/types';

const ruleName = 'asyncapi-tags';

describe(`Rule '${ruleName}'`, () => {
  let s: Spectral;
  let doc: any;

  beforeEach(async () => {
    s = await createWithRules([ruleName]);

    doc = {
      asyncapi: '2.0.0',
      tags: [{ name: 'one' }, { name: 'another' }],
    };
  });

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if tags property is missing', async () => {
    delete doc.tags;

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'AsyncAPI object should have non-empty `tags` array.',
        path: [],
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });
});
