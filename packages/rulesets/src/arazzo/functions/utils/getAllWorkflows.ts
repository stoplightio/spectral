import { isPlainObject } from '@stoplight/json';
import type { JsonPath } from '@stoplight/types';

type WorkflowObject = Record<string, unknown>;
type ArazzoDocument = {
  workflows?: WorkflowObject[];
};
type Result = { path: JsonPath; workflow: WorkflowObject };

export function* getAllWorkflows(arazzo: ArazzoDocument): IterableIterator<Result> {
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
