import { DeepPartial } from '@stoplight/types';
import arazzoStepIdUniqueness from '../arazzoStepIdUniqueness';
import type { RulesetFunctionContext } from '@stoplight/spectral-core';

const runRule = (target: { steps: Array<{ stepId: string }> }) => {
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
  };

  return arazzoStepIdUniqueness(target, null, context as RulesetFunctionContext);
};

describe('arazzoStepIdUniqueness', () => {
  test('should not report any errors for unique stepIds', () => {
    const results = runRule({
      steps: [{ stepId: 'step1' }, { stepId: 'step2' }],
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for duplicate stepIds', () => {
    const results = runRule({
      steps: [{ stepId: 'step1' }, { stepId: 'step1' }],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"stepId" must be unique within the workflow.`,
      path: ['steps', 1, 'stepId'],
    });
  });

  test('should not report an error for case-sensitive unique stepIds', () => {
    const results = runRule({
      steps: [{ stepId: 'step1' }, { stepId: 'Step1' }],
    });

    expect(results).toHaveLength(0);
  });
});
