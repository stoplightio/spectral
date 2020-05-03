import { cloneDeep } from 'lodash';

import { buildTestSpectralWithAsyncApiRule } from '../../../../setupTests';
import { Rule } from '../../../rule';
import { Spectral } from '../../../spectral';

const ruleName = 'asyncapi-tags-alphabetical';
let s: Spectral;
let rule: Rule;

describe(`Rule '${ruleName}'`, () => {
  beforeEach(async () => {
    [s, rule] = await buildTestSpectralWithAsyncApiRule(ruleName);
  });

  const doc: any = {
    asyncapi: '2.0.0',
    tags: [{ name: 'a tag' }, { name: 'another tag' }],
  };

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if tags are not sorted', async () => {
    const clone = cloneDeep(doc);

    clone.tags = [{ name: 'wrongly ordered' }, ...clone.tags];

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'AsyncAPI object should have alphabetical `tags`.',
        path: ['tags'],
        severity: rule.severity,
      }),
    ]);
  });
});
