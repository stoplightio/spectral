import { IFunctionResult } from '@stoplight/spectral-core';
import { getAllWorkflows } from './utils/getAllWorkflows';
import arazzoRuntimeExpressionValidation from './arazzoRuntimeExpressionValidation';
import { ArazzoSpecification } from './types/arazzoTypes';

export default function arazzoWorkflowDependsOnValidation(
  targetVal: ArazzoSpecification,
  _options: null,
): IFunctionResult[] {
  const results: IFunctionResult[] = [];
  const localWorkflowIds = new Set<string>();
  const sourceDescriptionNames = new Map((targetVal.sourceDescriptions ?? []).map(sd => [sd.name, sd.type]));

  const workflows = targetVal.workflows ?? [];
  for (const { workflow } of getAllWorkflows({ workflows })) {
    if ('workflowId' in workflow && typeof workflow.workflowId === 'string') {
      localWorkflowIds.add(workflow.workflowId);
    }
  }

  for (const { workflow, path } of getAllWorkflows({ workflows })) {
    const seenWorkflows = new Set<string>();

    if (Array.isArray(workflow.dependsOn)) {
      workflow.dependsOn.forEach((dep: string | unknown, depIndex: number) => {
        if (typeof dep !== 'string') {
          return; // Skip non-string dependencies
        }

        // Check for uniqueness
        if (seenWorkflows.has(dep)) {
          results.push({
            message: `Duplicate workflowId "${dep}" in dependsOn for workflow "${workflow.workflowId}".`,
            path: [...path, 'dependsOn', depIndex],
          });
          return;
        } else {
          seenWorkflows.add(dep);
        }

        if (dep.startsWith('$')) {
          if (!arazzoRuntimeExpressionValidation(dep, targetVal)) {
            results.push({
              message: `Runtime expression "${dep}" is invalid.`,
              path: [...path, 'dependsOn', depIndex],
            });
          }
        }

        // Check for runtime expression format
        if (dep.startsWith('$sourceDescriptions.')) {
          const parts = dep.split('.');
          const sourceName = parts[1];
          const workflowId = parts[2] as string | undefined;

          const sourceType = sourceDescriptionNames.get(sourceName);
          if (sourceType == null) {
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
              message: `WorkflowId "${dep}" not found in local Arazzo workflows "${workflow.workflowId}".`,
              path: [...path, 'dependsOn', depIndex],
            });
          }
        }
      });
    }
  }

  return results;
}
