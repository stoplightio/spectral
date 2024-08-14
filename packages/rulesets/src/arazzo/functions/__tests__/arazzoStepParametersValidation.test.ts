import { DeepPartial } from '@stoplight/types';
import arazzoStepParametersValidation from '../arazzoStepParametersValidation';
import type { RulesetFunctionContext } from '@stoplight/spectral-core';

type Parameter = {
  name: string;
  in?: string;
};

type ReusableObject = {
  reference: string;
};

type Step = {
  parameters?: (Parameter | ReusableObject)[];
  workflowId?: string;
  operationId?: string;
  operationPath?: string;
};

const runRule = (
  target: { steps: Step[]; parameters?: Parameter[]; components?: { parameters?: Record<string, Parameter> } },
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

  return arazzoStepParametersValidation(target, null, context as RulesetFunctionContext);
};

describe('arazzoStepParametersValidation', () => {
  test('should not report any errors for valid and unique parameters', () => {
    const results = runRule({
      steps: [
        {
          parameters: [
            { name: 'param1', in: 'query' },
            { name: 'param2', in: 'header' },
          ],
        },
      ],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(0);
  });

  test('should not report any errors for valid and unique parameters at step and workflow level', () => {
    const results = runRule({
      steps: [
        {
          parameters: [
            { name: 'param1', in: 'query' },
            { name: 'param2', in: 'header' },
          ],
        },
      ],
      components: { parameters: { param1: { name: 'param3', in: 'cookie' } } },
    });

    expect(results).toHaveLength(0);
  });

  test('should handle combined parameters from step and workflow without "in" when "workflowId" is specified', () => {
    const results = runRule({
      steps: [
        {
          workflowId: 'workflow1',
          parameters: [{ name: 'param1' }],
        },
        {
          workflowId: 'workflow1',
          parameters: [{ name: 'param2' }],
        },
      ],
      parameters: [{ name: 'param3' }, { name: 'param4' }],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(0);
  });

  test('should handle combined parameters from step and workflow with "in" when "operationPath" is specified', () => {
    const results = runRule({
      steps: [
        {
          operationPath: '/path1',
          parameters: [{ name: 'param1', in: 'query' }],
        },
        {
          operationPath: '/path2',
          parameters: [{ name: 'param2', in: 'header' }],
        },
      ],
      parameters: [
        { name: 'param1', in: 'cookie' },
        { name: 'param2', in: 'cookie' },
      ],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for duplicate parameters within the same step', () => {
    const results = runRule({
      steps: [
        {
          parameters: [
            { name: 'param1', in: 'query' },
            { name: 'param1', in: 'query' },
          ],
        }, // Duplicate parameter
      ],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"param1" with "in" value "query" must be unique within the combined parameters.`,
      path: ['steps', 0, 'parameters', 1],
    });
  });

  test('should report an error for duplicate reusable parameters', () => {
    const results = runRule({
      steps: [
        {
          parameters: [{ reference: '$components.parameters.param1' }, { reference: '$components.parameters.param1' }],
        },
      ],
      components: { parameters: { param1: { name: 'param1', in: 'query' } } },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"param1" with "in" value "query" must be unique within the combined parameters.`,
      path: ['steps', 0, 'parameters', 0],
    });
  });

  test('should report an error for combined duplicate parameters from step and workflow level', () => {
    const results = runRule({
      steps: [
        {
          workflowId: 'workflow1',
          parameters: [{ name: 'param1' }],
        },
      ],
      parameters: [{ name: 'param1' }],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `Duplicate parameter: "param1" must be unique within the combined parameters.`,
      path: ['steps', 0, 'parameters', 1],
    });
  });

  test('should report an error for mixed "in" presence when "workflowId" is present', () => {
    const results = runRule({
      steps: [
        {
          workflowId: 'workflow1',
          parameters: [{ name: 'param1' }, { name: 'param2', in: 'query' }],
        },
      ],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      message: `Parameters must not mix "in" field presence.`,
      path: ['steps', 0, 'parameters'],
    });
  });

  test('should report an error for parameters containing "in" when "workflowId" is present', () => {
    const results = runRule({
      steps: [
        {
          workflowId: 'workflow1',
          parameters: [
            { name: 'param1', in: 'header' },
            { name: 'param2', in: 'query' },
          ],
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `Step with "workflowId" must not have parameters with an "in" field.`,
      path: ['steps', 0, 'parameters'],
    });
  });

  test('should report an error for parameters missing "in" when "operationId" is present', () => {
    const results = runRule({
      steps: [
        {
          operationId: 'operation1',
          parameters: [{ name: 'param1' }, { name: 'param2' }],
        },
      ],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `Step with "operationId" or "operationPath" must have parameters with an "in" field.`,
      path: ['steps', 0, 'parameters'],
    });
  });

  test('should report an error for combined duplicate parameters from step and workflow with "in" when "operationId" is specified', () => {
    const results = runRule({
      steps: [
        {
          operationId: 'operation1',
          parameters: [{ name: 'param1', in: 'query' }],
        },
      ],
      parameters: [{ name: 'param1', in: 'query' }],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `Duplicate parameter: "param1" must be unique within the combined parameters.`,
      path: ['steps', 0, 'parameters', 1],
    });
  });

  test('should handle combined parameters from step and workflow with "in" when "operationId" is specified', () => {
    const results = runRule({
      steps: [
        {
          operationId: 'operation1',
          parameters: [{ name: 'param1', in: 'query' }],
        },
        {
          operationId: 'operation2',
          parameters: [{ name: 'param2', in: 'header' }],
        },
      ],
      parameters: [
        { name: 'param1', in: 'header' },
        { name: 'param2', in: 'query' },
      ],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for combined duplicate parameters from step and workflow with "in" when "operationPath" is specified', () => {
    const results = runRule({
      steps: [
        {
          operationPath: '/path1',
          parameters: [{ name: 'param1', in: 'query' }],
        },
      ],
      parameters: [{ name: 'param1', in: 'query' }],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `Duplicate parameter: "param1" must be unique within the combined parameters.`,
      path: ['steps', 0, 'parameters', 1],
    });
  });
});
