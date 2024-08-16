import { IFunctionResult } from '@stoplight/spectral-core';
import { getAllWorkflows } from './utils/getAllWorkflows';

type SourceDescription = {
  name: string;
  url: string;
  type?: string;
};

type Workflow = {
  workflowId: string;
  dependsOn?: string[];
};

type Document = {
  workflows: Workflow[];
  sourceDescriptions: SourceDescription[];
};

export default function arazzoWorkflowDependsOnValidation(targetVal: Document, _options: null): IFunctionResult[] {
  const results: IFunctionResult[] = [];
  const localWorkflowIds = new Set<string>();
  const sourceDescriptionNames = new Map(targetVal.sourceDescriptions.map(sd => [sd.name, sd.type]));

  for (const { workflow } of getAllWorkflows(targetVal)) {
    if ('workflowId' in workflow && typeof workflow.workflowId === 'string') {
      localWorkflowIds.add(workflow.workflowId);
    }
  }

  for (const { workflow, path } of getAllWorkflows(targetVal)) {
    const seenWorkflows = new Set<string>();

    if (Boolean(workflow.dependsOn) && Array.isArray(workflow.dependsOn)) {
      workflow.dependsOn.forEach((dep: string | unknown, depIndex: number) => {
        if (typeof dep !== 'string') {
          return; // Skip non-string dependencies
        }

        // Check for uniqueness
        if (seenWorkflows.has(dep)) {
          results.push({
            message: `Duplicate workflowId "${dep}" in dependsOn for workflow "${workflow.workflowId as string}".`,
            path: [...path, 'dependsOn', depIndex],
          });
          return;
        } else {
          seenWorkflows.add(dep);
        }

        // Check for runtime expression format
        if (dep.startsWith('$sourceDescriptions.')) {
          const parts = dep.split('.');
          const sourceName = parts[1];
          const workflowId = parts[2] as string | undefined;

          const sourceType = sourceDescriptionNames.get(sourceName);
          if (!sourceType) {
            results.push({
              message: `Source description "${sourceName}" not found for workflowId "${dep}".`,
              path: [...path, 'dependsOn', depIndex],
            });
          } else if (sourceType !== 'arazzo') {
            results.push({
              message: `Source description "${sourceName}" must have a type of "arazzo".`,
              path: [...path, 'dependsOn', depIndex],
            });
          } else if (workflowId == null) {
            results.push({
              message: `WorkflowId part is missing in the expression "${dep}".`,
              path: [...path, 'dependsOn', depIndex],
            });
          }
        } else {
          // Check against locally defined workflows
          if (!localWorkflowIds.has(dep)) {
            results.push({
              message: `WorkflowId "${dep}" not found in local Arazzo workflows "${workflow.workflowId as string}".`,
              path: [...path, 'dependsOn', depIndex],
            });
          }
        }
      });
    }
  }

  return results;
}
