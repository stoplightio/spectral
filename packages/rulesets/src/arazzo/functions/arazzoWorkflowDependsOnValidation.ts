import { IFunctionResult } from '@stoplight/spectral-core';
import { getAllWorkflows } from './utils/getAllWorkflows';
import arazzoRuntimeExpressionValidation from './arazzoRuntimeExpressionValidation';

type SourceDescription = {
  name: string;
  url: string;
  type?: string;
};

type Workflow = {
  workflowId: string;
  steps: Step[];
  dependsOn?: string[];
};

type Step = {
  stepId: string;
  outputs?: { [key: string]: string };
};

type ArazzoSpecification = {
  workflows: Workflow[];
  sourceDescriptions?: SourceDescription[];
  components?: {
    parameters?: Record<string, unknown>;
    successActions?: Record<string, SuccessAction>;
    failureActions?: Record<string, FailureAction>;
    [key: string]: unknown;
  };
};

type SuccessAction = {
  name: string;
  type: string;
  workflowId?: string;
  stepId?: string;
  criteria?: Criterion[];
};

type FailureAction = {
  name: string;
  type: string;
  workflowId?: string;
  stepId?: string;
  criteria?: Criterion[];
};

type Criterion = {
  context?: string;
  condition: string;
  type?: 'simple' | 'regex' | 'jsonpath' | 'xpath' | CriterionExpressionType;
};

type CriterionExpressionType = {
  type: 'jsonpath' | 'xpath';
  version: string;
};

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
            message: `Duplicate workflowId "${dep}" in dependsOn for workflow "${workflow.workflowId as string}".`,
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
