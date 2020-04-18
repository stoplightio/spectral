import { cloneDeep } from 'lodash';

import { buildTestSpectralWithAsyncApiRule } from '../../../../setupTests';
import { Spectral } from '../../../spectral';
import { IRunRule } from '../../../types';

const ruleName = 'asyncapi-server-not-example-com';
let s: Spectral;
let rule: IRunRule;

describe(`Rule '${ruleName}'`, () => {
  beforeEach(async () => {
    [s, rule] = await buildTestSpectralWithAsyncApiRule(ruleName);
  });

  const doc: any = {
    asyncapi: '2.0.0',
    servers: {
      production: {
        url: 'stoplight.io',
        protocol: 'https',
      },
    },
  };

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if {server}.url property is set to `example.com`', async () => {
    const clone = cloneDeep(doc);

    clone.servers.production.url = 'example.com';

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Server URL should not point at example.com.',
        path: ['servers', 'production', 'url'],
        severity: rule.severity,
      }),
    ]);
  });
});
