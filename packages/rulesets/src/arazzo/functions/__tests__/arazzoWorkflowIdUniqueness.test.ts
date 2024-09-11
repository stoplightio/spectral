import { IFunctionResult } from '@stoplight/spectral-core';
import arazzoWorkflowIdUniqueness from '../arazzoWorkflowIdUniqueness';
import { ArazzoSpecification } from '../types/arazzoTypes';

const runRule = (target: ArazzoSpecification): IFunctionResult[] => {
  return arazzoWorkflowIdUniqueness(target, null);
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
      message: `"workflowId" must be unique across all workflows. "workflow1" is duplicated.`,
      path: ['workflows', 1, 'workflowId'],
    });
  });
});
