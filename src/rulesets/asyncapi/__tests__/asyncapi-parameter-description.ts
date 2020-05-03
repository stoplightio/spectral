import { cloneDeep } from 'lodash';

import { buildTestSpectralWithAsyncApiRule } from '../../../../setupTests';
import { Rule } from '../../../rule';
import { Spectral } from '../../../spectral';

const ruleName = 'asyncapi-parameter-description';
let s: Spectral;
let rule: Rule;

describe(`Rule '${ruleName}'`, () => {
  beforeEach(async () => {
    [s, rule] = await buildTestSpectralWithAsyncApiRule(ruleName);
  });

  const doc: any = {
    asyncapi: '2.0.0',
    channels: {
      'users/{userId}/signedUp': {
        parameters: {
          userId: {
            description: 'The identifier of the user being tracked.',
          },
        },
      },
    },
    components: {
      parameters: {
        orphanParameter: {
          description: 'A defined, but orphaned, parameter.',
        },
      },
    },
  };

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if channels.{channel}.parameters.{parameter} lack a description', async () => {
    const clone = cloneDeep(doc);

    delete clone.channels['users/{userId}/signedUp'].parameters.userId.description;

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Parameter objects should have a `description`.',
        path: ['channels', 'users/{userId}/signedUp', 'parameters', 'userId'],
        severity: rule.severity,
      }),
    ]);
  });

  test('return result if components.parameters.{parameter} lack a description', async () => {
    const clone = cloneDeep(doc);

    delete clone.components.parameters.orphanParameter.description;

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Parameter objects should have a `description`.',
        path: ['components', 'parameters', 'orphanParameter'],
        severity: rule.severity,
      }),
    ]);
  });
});
