import arazzoStepOutputNamesValidation from '../arazzoStepOutputNamesValidation';
import { DeepPartial } from '@stoplight/types';
import type { RulesetFunctionContext } from '@stoplight/spectral-core';

const runRule = (
  target: {
    workflows: Array<{
      workflowId: string;
      steps: Array<{
        stepId: string;
        outputs?: { [key: string]: string };
      }>;
    }>;
    components?: Record<string, unknown>;
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

  return arazzoStepOutputNamesValidation(target, null, context as RulesetFunctionContext);
};

describe('arazzoStepOutputNamesValidation', () => {
  test('should not report any errors for valid and unique output names', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              outputs: {
                output1: '$url',
                output2: '$response.body#/status',
              },
              stepId: 'step1',
            },
            {
              outputs: { output3: '$steps.step1.outputs.output1' },
              stepId: 'step2',
            },
          ],
        },
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for invalid output names', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              outputs: {
                'invalid name': '$url',
                output2: '$statusCode',
              },
              stepId: 'step1',
            },
          ],
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"invalid name" does not match the required pattern "^[a-zA-Z0-9.\\-_]+$".`,
      path: ['workflows', 0, 'steps', 0, 'outputs', 'invalid name', 0],
    });
  });

  test('should report an error for invalid step name in output expression', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              outputs: {
                output1: '$statusCode',
              },
              stepId: 'step1',
            },
            {
              outputs: {
                foo: '$steps.non-existing-step.outputs.output1',
              },
              stepId: 'step2',
            },
          ],
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"$steps.non-existing-step.outputs.output1" is not a valid runtime expression.`,
      path: ['workflows', 0, 'steps', 1, 'outputs', 'foo', 0],
    });
  });

  test('should not report an error for duplicate output names across different steps', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            { outputs: { output1: '$response.body' }, stepId: 'step1' },
            { outputs: { output1: '$response.body' }, stepId: 'step2' }, // Duplicate output name across different steps
          ],
        },
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should not report any errors for valid runtime expressions', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              outputs: {
                output1: '$response.body#/status',
                output2: '$steps.step1.outputs.value',
              },
              stepId: 'step1',
            },
          ],
        },
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for invalid runtime expressions', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              outputs: { output1: 'invalid expression' },
              stepId: 'step1',
            },
          ],
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"invalid expression" is not a valid runtime expression.`,
      path: ['workflows', 0, 'steps', 0, 'outputs', 'output1', 0],
    });
  });

  test('should handle valid and invalid expressions mixed', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              outputs: {
                validOutput: '$response.body#/status',
                invalidOutput: 'invalid expression',
              },
              stepId: 'step1',
            },
          ],
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"invalid expression" is not a valid runtime expression.`,
      path: ['workflows', 0, 'steps', 0, 'outputs', 'invalidOutput', 1],
    });
  });
});
