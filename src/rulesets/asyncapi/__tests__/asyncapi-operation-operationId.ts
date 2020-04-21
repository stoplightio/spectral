import { cloneDeep } from 'lodash';

import { buildTestSpectralWithAsyncApiRule } from '../../../../setupTests';
import { Spectral } from '../../../spectral';
import { IRunRule } from '../../../types';

const ruleName = 'asyncapi-operation-operationId';
let s: Spectral;
let rule: IRunRule;

describe(`Rule '${ruleName}'`, () => {
  beforeEach(async () => {
    [s, rule] = await buildTestSpectralWithAsyncApiRule(ruleName);
  });

  const doc: any = {
    asyncapi: '2.0.0',
    channels: {
      one: {
        publish: {
          operationId: 'onePubId',
        },
        subscribe: {
          operationId: 'oneSubId',
        },
      },
    },
  };

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test.each(['publish', 'subscribe'])(
    'return result if channels.{channel}.%s.operationId property is missing',
    async (property: string) => {
      const clone = cloneDeep(doc);

      delete clone.channels.one[property].operationId;

      const results = await s.run(clone, { ignoreUnknownFormat: false });

      expect(results).toEqual([
        expect.objectContaining({
          code: ruleName,
          message: 'Operation should have an `operationId`.',
          path: ['channels', 'one', property],
          severity: rule.severity,
        }),
      ]);
    },
  );
});
