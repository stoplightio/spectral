import arazzoWorkflowOutputNamesValidation from '../arazzoWorkflowOutputNamesValidation';
import { DeepPartial } from '@stoplight/types';
import type { RulesetFunctionContext } from '@stoplight/spectral-core';
import { ArazzoSpecification } from '../types/arazzoTypes';

const runRule = (target: ArazzoSpecification, contextOverrides: Partial<RulesetFunctionContext> = {}) => {
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

  return arazzoWorkflowOutputNamesValidation(target, null, context as RulesetFunctionContext);
};

describe('arazzoWorkflowOutputNamesValidation', () => {
  test('should not report any errors for valid and unique output names', () => {
    const results = runRule({
      workflows: [
        {
          outputs: {
            output1: '$url',
            output2: '$statusCode',
          },
          workflowId: 'workflow§',
          steps: [],
        },
        {
          outputs: { output3: '$statusCode' },
          workflowId: 'workflow2',
          steps: [],
        },
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for invalid output names', () => {
    const results = runRule({
      workflows: [
        {
          outputs: {
            'invalid name': 'value1',
            output2: 'value2',
          },
          workflowId: 'workflow1',
          steps: [],
        },
      ],
    });

    expect(results).toHaveLength(3);
    expect(results[0]).toMatchObject({
      message: `"invalid name" does not match the required pattern "^[a-zA-Z0-9.\\-_]+$".`,
      path: ['workflows', 0, 'outputs', 'invalid name', 0],
    });
  });

  test('should not report an error for duplicate output names across different workflows', () => {
    const results = runRule({
      workflows: [
        {
          outputs: { output1: '$statusCode' },
          workflowId: 'workflow1',
          steps: [],
        },
        {
          outputs: { output1: '$statusCode' },
          workflowId: 'workflow2',
          steps: [],
        }, // Duplicate output name across different workflows
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for invalid runtime expressions', () => {
    const results = runRule({
      workflows: [
        {
          outputs: {
            output1: 'invalid expression',
            output2: '$statusCode',
          },
          workflowId: 'workflow1',
          steps: [],
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"invalid expression" is not a valid runtime expression.`,
      path: ['workflows', 0, 'outputs', 'output1', 0],
    });
  });

  test('should report an error for runtime expression referencing step that does not exist', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [{ stepId: 'step1', outputs: { output1: '$statusCode' } }],
          outputs: {
            output1: '$steps.non-existing.outputs.output1',
          },
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"$steps.non-existing.outputs.output1" is not a valid runtime expression.`,
      path: ['workflows', 0, 'outputs', 'output1', 0],
    });
  });

  test('should handle runtime expression referencing step that exists', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [{ stepId: 'step-1', outputs: { output1: '$statusCode' } }],
          outputs: {
            output1: '$steps.step-1.outputs.output1',
          },
        },
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should handle runtime expression referencing a step within a different workflow', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'place-order1',
          steps: [
            {
              stepId: 'place-order',
              operationId: 'placeOrder',
              outputs: { step_order_id: '$statusCode' },
            },
          ],
          outputs: {
            workflow_order_id: '$steps.place-order.outputs.step_order_id',
          },
        },
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should handle runtime expression referencing step that exists within different workflow', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [{ stepId: 'step1', outputs: { output1: '$statusCode' } }],
          outputs: {
            output1: '$steps.step1.outputs.output1',
          },
        },
        {
          workflowId: 'workflow2',
          steps: [{ stepId: 'step1', outputs: { output1: '$statusCode' } }],
          outputs: {
            output1: '$workflows.workflow1.steps.step1.outputs.output1',
          },
        },
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for runtime expression referencing a workflow that does not exist', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [{ stepId: 'step1', outputs: { output1: '$statusCode' } }],
          outputs: {
            output1: '$statusCode',
          },
        },
        {
          workflowId: 'workflow2',
          steps: [{ stepId: 'step1', outputs: { output1: '$statusCode' } }],
          outputs: {
            output1: '$workflows.non-existing-workflow.steps.foo.outputs.output1',
          },
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"$workflows.non-existing-workflow.steps.foo.outputs.output1" is not a valid runtime expression.`,
      path: ['workflows', 1, 'outputs', 'output1', 0],
    });
  });

  test('should report an error for runtime expression referencing a separate existing workflow but with non-existing step', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [{ stepId: 'step1', outputs: { output1: '$statusCode' } }],
          outputs: {
            output1: '$statusCode',
          },
        },
        {
          workflowId: 'workflow2',
          steps: [{ stepId: 'step1', outputs: { output1: '$statusCode' } }],
          outputs: {
            output1: '$workflows.workflow1.steps.non-existing.outputs.output1',
          },
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"$workflows.workflow1.steps.non-existing.outputs.output1" is not a valid runtime expression.`,
      path: ['workflows', 1, 'outputs', 'output1', 0],
    });
  });

  test('should handle runtime expression referencing a step within the same workflow', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'buy-available-pet',
          steps: [
            {
              stepId: 'find-pet',
              operationId: 'findPetsByStatus',
              outputs: { my_pet_id: '$response.outputs[0].id' },
            },
            {
              stepId: 'place-order',
              workflowId: 'place-order1',
              outputs: { my_order_id: '$workflows.place-order1.outputs.workflow_order_id' },
            },
          ],
          outputs: {
            buy_pet_order_id: '$steps.place-order.outputs.my_order_id',
          },
        },
        {
          workflowId: 'place-order',
          steps: [
            {
              stepId: 'place-order',
              operationId: 'placeOrder',
              outputs: { step_order_id: '$statusCode' },
            },
          ],
          outputs: {
            workflow_order_id: '$steps.place-order.outputs.step_order_id',
          },
        },
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should report error if workflow or step does not exist', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'buy-available-pet',
          steps: [
            {
              stepId: 'find-pet',
              operationId: 'findPetsByStatus',
              outputs: { my_pet_id: '$response.outputs[0].id' },
            },
            {
              stepId: 'place-order',
              workflowId: 'non-existing-workflow',
              outputs: { my_order_id: '$workflows.place-order.outputs.workflow_order_id' },
            },
          ],
          outputs: {
            buy_pet_order_id: '$steps.non-existing-step.outputs.non_existing',
          },
        },
      ],
    });

    expect(results).not.toHaveLength(0);
  });
});
