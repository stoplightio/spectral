import validateRequestBody from '../arazzoStepRequestBodyValidation';
import { DeepPartial } from '@stoplight/types';
import type { RulesetFunctionContext } from '@stoplight/spectral-core';

const runRule = (
  target: {
    steps: Array<{
      requestBody?: {
        contentType?: string;
        payload?: unknown;
        replacements?: Array<{ target: string; value: unknown }>;
      };
    }>;
  },
  contextOverrides: Partial<RulesetFunctionContext> = {},
) => {
  const context: DeepPartial<RulesetFunctionContext> = {
    path: [],
    documentInventory: {
      graph: {} as any, // Mock the graph property
      referencedDocuments: {} as any, // Mock the referencedDocuments property as a Dictionary
      findAssociatedItemForPath: jest.fn(), // Mock the findAssociatedItemForPath function
    },
    document: {
      formats: new Set(), // Mock the formats property correctly
    },
    ...contextOverrides,
  };

  return validateRequestBody(target, null, context as RulesetFunctionContext);
};

describe('validateRequestBody', () => {
  test('should not report any errors for valid requestBody', () => {
    const results = runRule({
      steps: [
        {
          requestBody: {
            contentType: 'application/json',
            payload: { key: 'value' },
            replacements: [{ target: '/key', value: 'newValue' }],
          },
        },
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for invalid MIME type in contentType', () => {
    const results = runRule({
      steps: [
        {
          requestBody: {
            contentType: 'invalid/type',
            payload: { key: 'value' },
          },
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: 'Invalid MIME type in contentType: invalid/type',
      path: ['steps', 0, 'requestBody', 'contentType'],
    });
  });

  test('should report an error for invalid runtime expression in payload', () => {
    const results = runRule({
      steps: [
        {
          requestBody: {
            contentType: 'application/json',
            payload: '$invalid.runtime.expression',
          },
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: 'Invalid runtime expression in payload: $invalid.runtime.expression',
      path: ['steps', 0, 'requestBody', 'payload'],
    });
  });

  test('should report an error for missing target in Payload Replacement', () => {
    const results = runRule({
      steps: [
        {
          requestBody: {
            contentType: 'application/json',
            payload: { key: 'value' },
            replacements: [{ target: '', value: 'newValue' }],
          },
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: '"target" is required in Payload Replacement.',
      path: ['steps', 0, 'requestBody', 'replacements', 0, 'target'],
    });
  });

  test('should report an error for invalid runtime expression in replacement value', () => {
    const results = runRule({
      steps: [
        {
          requestBody: {
            contentType: 'application/json',
            payload: { key: 'value' },
            replacements: [{ target: '/key', value: '$invalid.runtime.expression' }],
          },
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: 'Invalid runtime expression in replacement value: $invalid.runtime.expression',
      path: ['steps', 0, 'requestBody', 'replacements', 0, 'value'],
    });
  });

  test('should not report any errors for valid runtime expressions in payload and replacements', () => {
    const results = runRule({
      steps: [
        {
          requestBody: {
            contentType: 'application/json',
            payload: '$inputs.validExpression',
            replacements: [{ target: '/key', value: '$outputs.someOutput' }],
          },
        },
      ],
    });

    expect(results).toHaveLength(0);
  });
});
