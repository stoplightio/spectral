import { isPlainObject } from '@stoplight/json';
import type { JsonPath } from '@stoplight/types';
import { ArazzoSpecification, Workflow } from '../types/arazzoTypes';

type Result = { path: JsonPath; workflow: Workflow };

export function* getAllWorkflows(arazzo: ArazzoSpecification): IterableIterator<Result> {
  const workflows = arazzo?.workflows;
  if (!Array.isArray(workflows)) {
    return;
  }

  for (const [index, workflow] of workflows.entries()) {
    if (!isPlainObject(workflow)) {
      continue;
    }

    yield {
      path: ['workflows', index],
      workflow,
    };
  }
}
