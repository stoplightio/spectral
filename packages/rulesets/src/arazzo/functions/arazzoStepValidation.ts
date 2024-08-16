import { IFunctionResult } from '@stoplight/spectral-core';
import arazzoRuntimeExpressionValidation from './arazzoRuntimeExpressionValidation';

type SourceDescription = {
  name: string;
  url: string;
  type?: string;
};

type Step = {
  stepId: string;
  operationId?: string;
  operationPath?: string;
  workflowId?: string;
};

type Workflow = {
  steps: Step[];
  sourceDescriptions: SourceDescription[];
};

const OPERATION_PATH_REGEX = /^\{\$sourceDescriptions\.[a-zA-Z0-9_-]+\.(url)\}$/;

export default function arazzoStepValidation(targetVal: Workflow, _options: null): IFunctionResult[] {
  const results: IFunctionResult[] = [];
  const sourceDescriptionNames = new Set(targetVal.sourceDescriptions.map(sd => sd.name));

  targetVal.steps.forEach((step, stepIndex) => {
    const { operationId, operationPath, workflowId } = step;

    // Validate operationId
    if (operationId != null) {
      if (operationId.startsWith('$')) {
        if (!arazzoRuntimeExpressionValidation(operationId)) {
          results.push({
            message: `Runtime expression "${operationId}" is invalid in step "${step.stepId}".`,
            path: ['steps', stepIndex, 'operationId'],
          });
        }

        const parts = operationId.split('.');
        const sourceName = parts[1];

        if (!sourceDescriptionNames.has(sourceName)) {
          results.push({
            message: `Source description "${sourceName}" not found for operationId "${operationId}" in step "${step.stepId}".`,
            path: ['steps', stepIndex, 'operationId'],
          });
        }
      }
    }

    // Validate operationPath as JSON Pointer with correct format
    if (operationPath != null) {
      if (!OPERATION_PATH_REGEX.test(operationPath)) {
        results.push({
          message: `OperationPath "${operationPath}" must be a valid runtime expression following the format "{$sourceDescriptions.<name>.url}".`,
          path: ['steps', stepIndex, 'operationPath'],
        });
      } else {
        const sourceName = operationPath.split('.')[1];

        if (!sourceDescriptionNames.has(sourceName)) {
          results.push({
            message: `Source description "${sourceName}" not found for operationPath "${operationPath}" in step "${step.stepId}".`,
            path: ['steps', stepIndex, 'operationPath'],
          });
        }
      }
    }

    // Validate workflowId
    if (workflowId != null) {
      if (workflowId.startsWith('$')) {
        if (!arazzoRuntimeExpressionValidation(workflowId)) {
          results.push({
            message: `Runtime expression "${workflowId}" is invalid in step "${step.stepId}".`,
            path: ['steps', stepIndex, 'workflowId'],
          });
        }

        const parts = workflowId.split('.');
        const sourceName = parts[1];

        if (!sourceDescriptionNames.has(sourceName)) {
          results.push({
            message: `Source description "${sourceName}" not found for workflowId "${workflowId}" in step "${step.stepId}".`,
            path: ['steps', stepIndex, 'workflowId'],
          });
        }
      }
    }
  });

  return results;
}
