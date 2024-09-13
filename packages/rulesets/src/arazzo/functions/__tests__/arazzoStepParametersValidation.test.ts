import arazzoStepParametersValidation from '../arazzoStepParametersValidation';
import type { RulesetFunctionContext } from '@stoplight/spectral-core';
import { ArazzoSpecification } from '../types/arazzoTypes';

const runRule = (target: ArazzoSpecification, _contextOverrides: Partial<RulesetFunctionContext> = {}) => {
  return arazzoStepParametersValidation(target, null);
};

describe('arazzoStepParametersValidation', () => {
  test('should not report any errors for valid and unique parameters', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              parameters: [
                { name: 'param1', in: 'query', value: 'value1' },
                { name: 'param2', in: 'header', value: 'value2' },
              ],
              stepId: 'step1',
            },
          ],
        },
      ],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(0);
  });

  test('should not report any errors for valid and unique parameters at step and workflow level', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              parameters: [
                { name: 'param1', in: 'query', value: 'value1' },
                { name: 'param2', in: 'header', value: 'value2' },
              ],
              stepId: 'step1',
            },
          ],
        },
      ],
      components: { parameters: { param1: { name: 'param3', in: 'cookie', value: 'value3' } } },
    });

    expect(results).toHaveLength(0);
  });

  test('should handle combined parameters from step and workflow without "in" when "workflowId" is specified', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              workflowId: 'workflow1',
              parameters: [{ name: 'param1', value: 'value1' }],
              stepId: 'step1',
            },
            {
              workflowId: 'workflow1',
              parameters: [{ name: 'param2', value: 'value2' }],
              stepId: 'step2',
            },
          ],
        },
      ],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(0);
  });

  test('should handle combined parameters from step and workflow with "in" when "operationPath" is specified', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              operationPath: '/path1',
              parameters: [{ name: 'param1', in: 'query', value: 'value1' }],
              stepId: 'step1',
            },
            {
              operationPath: '/path2',
              parameters: [{ name: 'param2', in: 'header', value: 'value2' }],
              stepId: 'step2',
            },
          ],
        },
      ],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for duplicate parameters within the same step', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              parameters: [
                { name: 'param1', in: 'query', value: 'value1' },
                { name: 'param1', in: 'query', value: 'value2' },
              ],
              stepId: 'step1',
            },
          ],
        },
      ],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      message: `"param1" must be unique within the combined parameters.`,
      path: ['workflows', 0, 'steps', 0, 'parameters', 1],
    });
  });

  test('should report an error for duplicate reusable parameters', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              parameters: [
                { reference: '$components.parameters.param1' },
                { reference: '$components.parameters.param1' },
              ],
              stepId: 'step1',
            },
          ],
        },
      ],
      components: {
        parameters: {
          param1: {
            name: 'param1',
            in: 'query',
            value: 'value1',
          },
        },
      },
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      message: `"param1" must be unique within the combined parameters.`,
      path: ['workflows', 0, 'steps', 0, 'parameters', 1],
    });
  });

  test('should handle combined duplicate parameters from step and workflow level (override scenario)', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              workflowId: 'workflow1',
              parameters: [{ name: 'param1', value: 'value1' }],
              stepId: 'step1',
            },
          ],
        },
      ],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for mixed "in" presence when "workflowId" is present', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              workflowId: 'workflow1',
              parameters: [
                { name: 'param1', value: 'value1' },
                { name: 'param2', in: 'query', value: 'value2' },
              ],
              stepId: 'step1',
            },
          ],
        },
      ],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      message: `Parameters must not mix "in" field presence.`,
      path: ['workflows', 0, 'steps', 0, 'parameters'],
    });
  });

  test('should report an error for parameters containing "in" when "workflowId" is present', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              workflowId: 'workflow1',
              parameters: [
                { name: 'param1', in: 'header', value: 'value1' },
                { name: 'param2', in: 'query', value: 'value2' },
              ],
              stepId: 'step1',
            },
          ],
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `Step with "workflowId" must not have parameters with an "in" field.`,
      path: ['workflows', 0, 'steps', 0, 'parameters'],
    });
  });

  test('should report an error for parameters missing "in" when "operationId" is present', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              operationId: 'operation1',
              parameters: [
                { name: 'param1', value: 'value1' },
                { name: 'param2', value: 'value2' },
              ],
              stepId: 'step1',
            },
          ],
        },
      ],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `Step with "operationId" or "operationPath" must have parameters with an "in" field.`,
      path: ['workflows', 0, 'steps', 0, 'parameters'],
    });
  });

  test('should handle combined duplicate parameters from step and workflow with "in" when "operationId" is specified (override scenario)', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              operationId: 'operation1',
              parameters: [{ name: 'param1', in: 'query', value: 'value1' }],
              stepId: 'step1',
            },
          ],
        },
      ],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(0);
  });

  test('should handle combined parameters from step and workflow with "in" when "operationId" is specified', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              operationId: 'operation1',
              parameters: [{ name: 'param1', in: 'query', value: 'value1' }],
              stepId: 'step1',
            },
            {
              operationId: 'operation2',
              parameters: [{ name: 'param2', in: 'header', value: 'value2' }],
              stepId: 'step2',
            },
          ],
        },
      ],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(0);
  });

  test('should handle combined duplicate parameters from step and workflow with "in" when "operationPath" is specified (override scenario)', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              operationPath: '/path1',
              parameters: [{ name: 'param1', in: 'query', value: 'value1' }],
              stepId: 'step1',
            },
          ],
        },
      ],
      components: { parameters: {} },
    });

    expect(results).toHaveLength(0);
  });

  // New Tests for Runtime Expressions

  test('should report an error for invalid $steps expression in parameter value', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              parameters: [{ name: 'foo', in: 'query', value: '$steps.invalidStep.outputs.param' }],
              stepId: 'step1',
            },
          ],
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `Invalid runtime expression: "$steps.invalidStep.outputs.param" for parameter.`,
      path: ['workflows', 0, 'steps', 0, 'parameters', 0],
    });
  });

  test('should not report errors for valid $steps expression in parameter name', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              parameters: [{ name: '$steps.validStep.outputs.param', in: 'query', value: 'value1' }],
              stepId: 'step1',
            },
            {
              stepId: 'validStep',
            },
          ],
        },
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for invalid $workflows expression in parameter value', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              parameters: [{ name: 'foo', in: 'query', value: '$workflows.invalidWorkflow.steps.step1.outputs.param' }],
              stepId: 'step1',
            },
          ],
        },
        {
          workflowId: 'validWorkflow',
          steps: [
            {
              stepId: 'step1',
              parameters: [{ name: 'param', in: 'query', value: 'value2' }],
            },
          ],
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `Invalid runtime expression: "$workflows.invalidWorkflow.steps.step1.outputs.param" for parameter.`,
      path: ['workflows', 0, 'steps', 0, 'parameters', 0],
    });
  });

  test('should not report errors for valid $workflows expression in parameter name', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              parameters: [
                { name: '$workflows.validWorkflow.steps.step1.outputs.param', in: 'query', value: 'value1' },
              ],
              stepId: 'step1',
            },
          ],
        },
        {
          workflowId: 'validWorkflow',
          steps: [
            {
              stepId: 'step1',
              parameters: [{ name: 'param', in: 'query', value: 'value2' }],
            },
          ],
        },
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for invalid $inputs expression in parameter value', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              parameters: [{ name: 'foo', in: 'query', value: '$inputs.invalidInput' }],
              stepId: 'step1',
            },
          ],
        },
        {
          workflowId: 'workflow1',
          inputs: {
            validInput: 'value2',
          },
          steps: [
            {
              stepId: 'step1',
              parameters: [{ name: 'param', in: 'query', value: 'value3' }],
            },
          ],
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `Invalid runtime expression: "$inputs.invalidInput" for parameter.`,
      path: ['workflows', 0, 'steps', 0, 'parameters', 0],
    });
  });

  test('should not report errors for valid $inputs expression in parameter name', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          inputs: {
            type: 'object',
            properties: {
              validInput: { type: 'string' },
            },
          },
          steps: [
            {
              stepId: 'step1',
              parameters: [{ name: 'value1', in: 'query', value: '$inputs.validInput' }],
            },
          ],
        },
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for invalid $components.parameters expression in parameter reference', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              parameters: [{ reference: '$components.parameters.invalidParam' }],
              stepId: 'step1',
            },
          ],
        },
      ],
      components: {
        parameters: {
          validParam: {
            name: 'param1',
            in: 'query',
            value: 'hello',
          },
        },
      },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `Invalid runtime expression for reusable parameter reference: "$components.parameters.invalidParam".`,
      path: ['workflows', 0, 'steps', 0, 'parameters', 0],
    });
  });

  test('should not report errors for valid $components.parameters expression in parameter reference', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              parameters: [{ reference: '$components.parameters.validParam' }],
              stepId: 'step1',
            },
          ],
        },
      ],
      components: {
        parameters: {
          validParam: {
            name: 'param1',
            in: 'query',
            value: 'value1',
          },
        },
      },
    });

    expect(results).toHaveLength(0);
  });

  test('should not report errors for valid $ref in workflow inputs', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          inputs: {
            $ref: '#/components/inputs/myInputRef',
          },
          steps: [
            {
              stepId: 'step1',
              parameters: [{ name: 'foo', in: 'query', value: '$inputs.validInput' }],
            },
          ],
        },
      ],
      components: {
        inputs: {
          myInputRef: {
            type: 'object',
            properties: {
              validInput: { type: 'string' },
            },
          },
        },
      },
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for invalid $ref in workflow inputs', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          inputs: {
            $ref: '#/components/inputs/myInputRef',
          },
          steps: [
            {
              stepId: 'step1',
              parameters: [{ name: 'foo', in: 'query', value: '$inputs.invalidInput' }],
            },
          ],
        },
      ],
      components: {
        inputs: {
          myInputRef: {
            type: 'object',
            properties: {
              validInput: { type: 'string' },
            },
          },
        },
      },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `Invalid runtime expression: "$inputs.invalidInput" for parameter.`,
      path: ['workflows', 0, 'steps', 0, 'parameters', 0],
    });
  });
});
