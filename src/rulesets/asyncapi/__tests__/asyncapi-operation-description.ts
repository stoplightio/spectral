import { cloneDeep } from 'lodash';

import { buildTestSpectralWithAsyncApiRule } from '../../../../setupTests';
import { Rule } from '../../../rule';
import { Spectral } from '../../../spectral';

const ruleName = 'asyncapi-operation-description';
let s: Spectral;
let rule: Rule;

describe(`Rule '${ruleName}'`, () => {
  beforeEach(async () => {
    [s, rule] = await buildTestSpectralWithAsyncApiRule(ruleName);
  });

  const doc: any = {
    asyncapi: '2.0.0',
    channels: {
      one: {
        publish: {
          description: 'I do this.',
        },
        subscribe: {
          description: '...and that',
        },
      },
    },
  };

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test.each(['publish', 'subscribe'])(
    'return result if channels.{channel}.%s.description property is missing',
    async (property: string) => {
      const clone = cloneDeep(doc);

      delete clone.channels.one[property].description;

      const results = await s.run(clone, { ignoreUnknownFormat: false });

      expect(results).toEqual([
        expect.objectContaining({
          code: ruleName,
          message: 'Operation `description` must be present and non-empty string.',
          path: ['channels', 'one', property],
          severity: rule.severity,
        }),
      ]);
    },
  );
});
