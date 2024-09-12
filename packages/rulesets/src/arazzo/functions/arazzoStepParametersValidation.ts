import type { IFunctionResult } from '@stoplight/spectral-core';
import getAllParameters from './utils/getAllParameters';
import arazzoRuntimeExpressionValidation from './arazzoRuntimeExpressionValidation';
import { ArazzoSpecification } from './types/arazzoTypes';

export default function arazzoStepParametersValidation(target: ArazzoSpecification, _options: null): IFunctionResult[] {
  const results: IFunctionResult[] = [];

  // Process each workflow
  if (Array.isArray(target.workflows)) {
    target.workflows.forEach((workflow, workflowIndex) => {
      // Process steps in the workflow
      workflow.steps.forEach((step, stepIndex) => {
        if (!step.parameters) return;

        const { workflowId, operationId, operationPath } = step;
        const stepParams = getAllParameters(step, workflow, target);

        if (Array.isArray(stepParams)) {
          const seenNames: Set<string> = new Set();
          stepParams.forEach((param, paramIndex) => {
            const originalName = param.name
              .replace('masked-invalid-reusable-parameter-reference-', '')
              .replace('masked-unresolved-parameter-reference-', '')
              .replace('masked-duplicate-', '');

            if (seenNames.has(originalName)) {
              results.push({
                message: `"${originalName}" must be unique within the combined parameters.`,
                path: ['workflows', workflowIndex, 'steps', stepIndex, 'parameters', paramIndex],
              });
            } else {
              seenNames.add(originalName);
            }

            if (param.name.startsWith('masked-invalid-reusable-parameter-reference-')) {
              results.push({
                message: `Invalid runtime expression for reusable parameter reference: "${originalName}".`,
                path: ['workflows', workflowIndex, 'steps', stepIndex, 'parameters', paramIndex],
              });
            }

            if (param.name.startsWith('masked-unresolved-parameter-reference-')) {
              results.push({
                message: `Unresolved reusable parameter reference: "${originalName}".`,
                path: ['workflows', workflowIndex, 'steps', stepIndex, 'parameters', paramIndex],
              });
            }

            if (param.name.startsWith('masked-duplicate-')) {
              results.push({
                message: `Duplicate parameter: "${originalName}" must be unique within the combined parameters.`,
                path: ['workflows', workflowIndex, 'steps', stepIndex, 'parameters', paramIndex],
              });
            }
          });
        }

        // Validate no mix of `in` presence
        const hasInField = stepParams.some(param => 'in' in param && param.in !== undefined);
        const noInField = stepParams.some(param => !('in' in param) || param.in === undefined);

        if (hasInField && noInField) {
          results.push({
            message: `Parameters must not mix "in" field presence.`,
            path: ['workflows', workflowIndex, 'steps', stepIndex, 'parameters'],
          });
        }

        // if workflowId is present, there should be no `in` field
        if (workflowId != null && hasInField) {
          results.push({
            message: `Step with "workflowId" must not have parameters with an "in" field.`,
            path: ['workflows', workflowIndex, 'steps', stepIndex, 'parameters'],
          });
        }

        // if operationId or operationPath is present, all parameters should have an `in` field
        if ((operationId != null || operationPath != null) && noInField) {
          results.push({
            message: `Step with "operationId" or "operationPath" must have parameters with an "in" field.`,
            path: ['workflows', workflowIndex, 'steps', stepIndex, 'parameters'],
          });
        }

        // Perform runtime expression validation for parameter values
        stepParams.forEach((param, paramIndex) => {
          if (typeof param.value === 'string' && param.value.startsWith('$')) {
            const validPatterns = [
              /^\$inputs\./, // Matches $inputs.
              /^\$steps\.[A-Za-z0-9_-]+\./, // Matches $steps.name.*
              /^\$workflows\.[A-Za-z0-9_-]+\.steps\.[A-Za-z0-9_-]+\./, // Matches $workflows.name.steps.stepname.*
            ];

            const isValidPattern = validPatterns.some(pattern => pattern.test(param.value as string));

            if (!isValidPattern) {
              results.push({
                message: `Invalid runtime expression: "${param.value}" for parameter.`,
                path: ['workflows', workflowIndex, 'steps', stepIndex, 'parameters', paramIndex],
              });
            } else if (!arazzoRuntimeExpressionValidation(param.value, target, workflowIndex)) {
              results.push({
                message: `Invalid runtime expression: "${param.value}" for parameter.`,
                path: ['workflows', workflowIndex, 'steps', stepIndex, 'parameters', paramIndex],
              });
            }
          }
        });
      });
    });
  }

  return results;
}
