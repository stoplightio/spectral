import { DeepPartial } from '@stoplight/types';
import arazzoWorkflowIdUniqueness from '../arazzoWorkflowIdUniqueness';
import type { RulesetFunctionContext } from '@stoplight/spectral-core';

const runRule = (target: { workflows: Record<string, unknown>[] }) => {
  const context: DeepPartial<RulesetFunctionContext> = {
    path: [],
    documentInventory: {
      graph: {} as any, // Mock the graph property
      referencedDocuments: {}, // Mock the referencedDocuments property as a Dictionary
      findAssociatedItemForPath: jest.fn(), // Mock the findAssociatedItemForPath function
    },
    document: {
      formats: new Set(), // Mock the formats property correctly
    },
  };

  return arazzoWorkflowIdUniqueness(target, null, context as RulesetFunctionContext);
};

describe('arazzoWorkflowIdUniqueness', () => {
  test('should not report any errors for unique workflowIds', async () => {
    const results = runRule({
      workflows: [
        { workflowId: 'workflow1', steps: [] },
        { workflowId: 'workflow2', steps: [] },
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for duplicate workflowIds', async () => {
    const results = runRule({
      workflows: [
        { workflowId: 'workflow1', steps: [] },
        { workflowId: 'workflow1', steps: [] },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"workflowId" must be unique across all workflows.`,
      path: ['workflows', 1, 'workflowId'],
    });
  });
});
