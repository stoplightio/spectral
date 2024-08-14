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
            ['output1', 'value1'],
            ['output2', 'value2'],
          ],
        },
        { outputs: [['output3', 'value3']] },
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for invalid output names', () => {
    const results = runRule({
      steps: [
        {
          outputs: [
            ['invalid name', 'value1'],
            ['output2', 'value2'],
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
            ['output1', 'value1'],
            ['output2', 'value2'],
            ['output1', 'value3'],
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
        { outputs: [['output1', 'value1']] },
        { outputs: [['output1', 'value2']] }, // Duplicate output name across different steps
      ],
    });

    expect(results).toHaveLength(0);
  });
});
