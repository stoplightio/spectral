import { cloneDeep } from 'lodash';

import { buildTestSpectralWithAsyncApiRule } from '../../../../setupTests';
import { Rule } from '../../../rule';
import { Spectral } from '../../../spectral';

const ruleName = 'asyncapi-servers';
let s: Spectral;
let rule: Rule;

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

  test('return result if servers property is missing', async () => {
    const clone = cloneDeep(doc);

    delete clone.servers;

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'AsyncAPI object should contain a non empty `servers` object.',
        path: [],
        severity: rule.severity,
      }),
    ]);
  });

  test('return result if servers property is empty', async () => {
    const clone = cloneDeep(doc);

    delete clone.servers.production;
    expect(clone.servers).toEqual({});

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'AsyncAPI object should contain a non empty `servers` object.',
        path: ['servers'],
        severity: rule.severity,
      }),
    ]);
  });
});
