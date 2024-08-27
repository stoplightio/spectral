import arazzoStepRequestBodyValidation from '../arazzoStepRequestBodyValidation';
import type { RulesetFunctionContext } from '@stoplight/spectral-core';
import { ArazzoSpecification } from '../types/arazzoTypes';

const runRule = (target: ArazzoSpecification, _contextOverrides: Partial<RulesetFunctionContext> = {}) => {
  return arazzoStepRequestBodyValidation(target, null);
};

describe('validateRequestBody', () => {
  test('should not report any errors for valid requestBody', () => {
    const results = runRule({
      workflows: [
        {
          steps: [
            {
              requestBody: {
                contentType: 'application/json',
                payload: { key: 'value' },
                replacements: [{ target: '/key', value: 'newValue' }],
              },
              stepId: 'step1',
            },
          ],
          workflowId: 'workflow1',
        },
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for invalid MIME type in contentType', () => {
    const results = runRule({
      workflows: [
        {
          steps: [
            {
              requestBody: {
                contentType: 'invalid/type',
                payload: { key: 'value' },
              },
              stepId: 'step1',
            },
          ],
          workflowId: 'workflow1',
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: 'Invalid MIME type in contentType: invalid/type',
      path: ['workflows', 0, 'steps', 0, 'requestBody', 'contentType'],
    });
  });

  test('should report an error for invalid runtime expression in payload', () => {
    const results = runRule({
      workflows: [
        {
          steps: [
            {
              requestBody: {
                contentType: 'application/json',
                payload: '$invalid.runtime.expression',
              },
              stepId: 'step1',
            },
          ],
          workflowId: 'workflow1',
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: 'Invalid runtime expression in payload: $invalid.runtime.expression',
      path: ['workflows', 0, 'steps', 0, 'requestBody', 'payload'],
    });
  });

  test('should report an error for missing target in Payload Replacement', () => {
    const results = runRule({
      workflows: [
        {
          steps: [
            {
              requestBody: {
                contentType: 'application/json',
                payload: { key: 'value' },
                replacements: [{ target: '', value: 'newValue' }],
              },
              stepId: 'step1',
            },
          ],
          workflowId: 'workflow1',
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: '"target" is required in Payload Replacement.',
      path: ['workflows', 0, 'steps', 0, 'requestBody', 'replacements', 0, 'target'],
    });
  });

  test('should report an error for invalid runtime expression in replacement value', () => {
    const results = runRule({
      workflows: [
        {
          steps: [
            {
              requestBody: {
                contentType: 'application/json',
                payload: { key: 'value' },
                replacements: [{ target: '/key', value: '$invalid.runtime.expression' }],
              },
              stepId: 'step1',
            },
          ],
          workflowId: 'workflow1',
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: 'Invalid runtime expression in replacement value: $invalid.runtime.expression',
      path: ['workflows', 0, 'steps', 0, 'requestBody', 'replacements', 0, 'value'],
    });
  });

  test('should report an error for invalid runtime expression in replacement value for non-existing input', () => {
    const results = runRule({
      workflows: [
        {
          steps: [
            {
              requestBody: {
                contentType: 'application/json',
                payload: { key: 'value' },
                replacements: [{ target: '/key', value: '$inputs.foo' }],
              },
              stepId: 'step1',
            },
          ],
          workflowId: 'workflow1',
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: 'Invalid runtime expression in replacement value: $inputs.foo',
      path: ['workflows', 0, 'steps', 0, 'requestBody', 'replacements', 0, 'value'],
    });
  });

  test('should not report any errors for valid runtime expressions in payload and replacements', () => {
    const results = runRule({
      workflows: [
        {
          steps: [
            {
              requestBody: {
                contentType: 'application/json',
                payload: '$inputs.validExpression',
                replacements: [{ target: '/key', value: '$outputs.someOutput' }],
              },
              stepId: 'step1',
            },
          ],
          workflowId: 'workflow1',
          inputs: {
            type: 'object',
            properties: {
              validExpression: {
                type: 'string',
              },
            },
          },
        },
      ],
    });

    expect(results).toHaveLength(0);
  });
});
