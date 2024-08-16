import arazzoStepOutputNamesValidation from '../arazzoStepOutputNamesValidation';
import { DeepPartial } from '@stoplight/types';
import type { RulesetFunctionContext } from '@stoplight/spectral-core';

const runRule = (
  target: { steps: Array<{ outputs?: [string, string][] }> },
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
      steps: [
        {
          outputs: [
            ['output1', '$url'],
            ['output2', '$response.body#/status'],
          ],
        },
        { outputs: [['output3', '$steps.foo.outputs.bar']] },
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for invalid output names', () => {
    const results = runRule({
      steps: [
        {
          outputs: [
            ['invalid name', '$url'],
            ['output2', '$statusCode'],
          ],
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"invalid name" does not match the required pattern "^[a-zA-Z0-9.\\-_]+$".`,
      path: ['steps', 0, 'outputs', 'invalid name'],
    });
  });

  test('should report an error for duplicate output names within the same step', () => {
    const results = runRule({
      steps: [
        {
          outputs: [
            ['output1', '$statusCode'],
            ['output2', '$url'],
            ['output1', '$statusCode'],
          ],
        }, // Duplicate key simulated here
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"output1" must be unique within the step outputs.`,
      path: ['steps', 0, 'outputs', 'output1'],
    });
  });

  test('should not report an error for duplicate output names across different steps', () => {
    const results = runRule({
      steps: [
        { outputs: [['output1', '$response.body']] },
        { outputs: [['output1', '$response.body']] }, // Duplicate output name across different steps
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should not report any errors for valid runtime expressions', () => {
    const results = runRule({
      steps: [
        {
          outputs: [
            ['output1', '$response.body#/status'],
            ['output2', '$steps.step1.outputs.value'],
          ],
        },
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for invalid runtime expressions', () => {
    const results = runRule({
      steps: [
        {
          outputs: [['output1', 'invalid expression']],
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"invalid expression" is not a valid runtime expression.`,
      path: ['steps', 0, 'outputs', 'output1'],
    });
  });

  test('should handle valid and invalid expressions mixed', () => {
    const results = runRule({
      steps: [
        {
          outputs: [
            ['validOutput', '$response.body#/status'],
            ['invalidOutput', 'invalid expression'],
          ],
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"invalid expression" is not a valid runtime expression.`,
      path: ['steps', 0, 'outputs', 'invalidOutput'],
    });
  });
});
