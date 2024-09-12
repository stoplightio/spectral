import type { IFunctionResult } from '@stoplight/spectral-core';
import arazzoRuntimeExpressionValidation from './arazzoRuntimeExpressionValidation';
import { ArazzoSpecification } from './types/arazzoTypes';

const OPERATION_PATH_REGEX = /^\{\$sourceDescriptions\.[a-zA-Z0-9_-]+\.(url)\}#.+$/;

export default function arazzoStepValidation(targetVal: ArazzoSpecification, _options: null): IFunctionResult[] {
  const results: IFunctionResult[] = [];

  if (!Array.isArray(targetVal.sourceDescriptions) || targetVal.sourceDescriptions.length === 0) {
    results.push({
      message: 'sourceDescriptions is missing in the Arazzo Specification.',
      path: ['sourceDescriptions'],
    });
    return results;
  }

  const sourceDescriptionNames = new Set(targetVal.sourceDescriptions.map(sd => sd.name));

  targetVal.workflows.forEach((workflow, workflowIndex) => {
    if (!Array.isArray(workflow.steps)) {
      // If the steps array is not defined or is not an array, skip this workflow
      return;
    }

    workflow.steps.forEach((step, stepIndex) => {
      const { operationId, operationPath, workflowId } = step;

      // Validate operationId
      if (operationId != null) {
        if (operationId.startsWith('$')) {
          if (!arazzoRuntimeExpressionValidation(operationId, targetVal)) {
            results.push({
              message: `Runtime expression "${operationId}" is invalid in step "${step.stepId}".`,
              path: ['workflows', workflowIndex, 'steps', stepIndex, 'operationId'],
            });
          }

          const parts = operationId.split('.');
          const sourceName = parts[1];

          if (!sourceDescriptionNames.has(sourceName)) {
            results.push({
              message: `Source description "${sourceName}" not found for operationId "${operationId}" in step "${step.stepId}".`,
              path: ['workflows', workflowIndex, 'steps', stepIndex, 'operationId'],
            });
          }
        }
      }

      // Validate operationPath as JSON Pointer with correct format
      if (operationPath != null) {
        if (!OPERATION_PATH_REGEX.test(operationPath)) {
          results.push({
            message: `OperationPath "${operationPath}" must be a valid runtime expression following the format "{$sourceDescriptions.<name>.url}#<json-pointer>".`,
            path: ['workflows', workflowIndex, 'steps', stepIndex, 'operationPath'],
          });
        } else {
          const sourceName = operationPath.split('.')[1];

          if (!sourceDescriptionNames.has(sourceName)) {
            results.push({
              message: `Source description "${sourceName}" not found for operationPath "${operationPath}" in step "${step.stepId}".`,
              path: ['workflows', workflowIndex, 'steps', stepIndex, 'operationPath'],
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
              path: ['workflows', workflowIndex, 'steps', stepIndex, 'workflowId'],
            });
          }

          const parts = workflowId.split('.');
          const sourceName = parts[1];

          if (!sourceDescriptionNames.has(sourceName)) {
            results.push({
              message: `Source description "${sourceName}" not found for workflowId "${workflowId}" in step "${step.stepId}".`,
              path: ['workflows', workflowIndex, 'steps', stepIndex, 'workflowId'],
            });
          }
        }
      }
    });
  });

  return results;
}
