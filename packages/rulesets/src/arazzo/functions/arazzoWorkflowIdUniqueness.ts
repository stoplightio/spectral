import { IFunctionResult } from '@stoplight/spectral-core';
import { getAllWorkflows } from './utils/getAllWorkflows';
import { ArazzoSpecification } from './types/arazzoTypes';

export default function arazzoWorkflowIdUniqueness(targetVal: ArazzoSpecification, _options: null): IFunctionResult[] {
  const results: IFunctionResult[] = [];
  const workflows = getAllWorkflows(targetVal);

  const seenIds: Set<string> = new Set();
  for (const { path, workflow } of workflows) {
    const workflowId = workflow.workflowId;
    if (seenIds.has(workflowId)) {
      results.push({
        message: `"workflowId" must be unique across all workflows. "${workflowId}" is duplicated.`,
        path: [...path, 'workflowId'],
      });
    } else {
      seenIds.add(workflowId);
    }
  }

  return results;
}
