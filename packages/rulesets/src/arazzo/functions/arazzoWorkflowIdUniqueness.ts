import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';
import { getAllWorkflows } from './utils/getAllWorkflows';

export default createRulesetFunction<{ workflows: Record<string, unknown>[] }, null>(
  {
    input: {
      type: 'object',
      properties: {
        workflows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              workflowId: {
                type: 'string',
              },
            },
          },
        },
      },
    },
    options: null,
  },
  function arazzoWorkflowIdUniqueness(targetVal, _) {
    const results: IFunctionResult[] = [];
    const workflows = getAllWorkflows(targetVal);

    const seenIds: Set<string> = new Set();
    for (const { path, workflow } of workflows) {
      const workflowId = workflow.workflowId as string;
      if (seenIds.has(workflowId)) {
        results.push({
          message: `"workflowId" must be unique across all workflows.`,
          path: [...path, 'workflowId'],
        });
      } else {
        seenIds.add(workflowId);
      }
    }

    return results;
  },
);
