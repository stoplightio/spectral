import type { IFunctionResult } from '@stoplight/spectral-core';
import getAllSuccessActions from './utils/getAllSuccessActions';
import arazzoCriterionValidation from './arazzoCriterionValidation';
import arazzoRuntimeExpressionValidation from './arazzoRuntimeExpressionValidation';
import { ArazzoSpecification } from './types/arazzoTypes';

export default function arazzoStepSuccessActionsValidation(
  target: ArazzoSpecification,
  _options: null,
): IFunctionResult[] {
  const results: IFunctionResult[] = [];

  if (Array.isArray(target.workflows)) {
    target.workflows.forEach((workflow, workflowIndex) => {
      if (Array.isArray(workflow.steps)) {
        workflow.steps.forEach((step, stepIndex) => {
          const resolvedActions = getAllSuccessActions(step, workflow, target);

          if (Array.isArray(resolvedActions)) {
            const seenNames: Set<string> = new Set();
            resolvedActions.forEach((action, actionIndex) => {
              const originalName = action.name.replace(
                /^(masked-(invalid-reusable-success-action-reference-|non-existing-success-action-reference-|duplicate-))/,
                '',
              );

              if (seenNames.has(originalName)) {
                results.push({
                  message: `"${originalName}" must be unique within the combined success actions.`,
                  path: ['workflows', workflowIndex, 'steps', stepIndex, 'onSuccess', actionIndex],
                });
              } else {
                seenNames.add(originalName);
              }

              if (action.name.startsWith('masked-invalid-reusable-success-action-reference-')) {
                results.push({
                  message: `Invalid runtime expression for reusable action reference: "${originalName}".`,
                  path: ['workflows', workflowIndex, 'steps', stepIndex, 'onSuccess', actionIndex],
                });
              }

              if (action.name.startsWith('masked-non-existing-success-action-reference-')) {
                results.push({
                  message: `Non-existing reusable action reference: "${originalName}".`,
                  path: ['workflows', workflowIndex, 'steps', stepIndex, 'onSuccess', actionIndex],
                });
              }

              if (action.name.startsWith('masked-duplicate-')) {
                results.push({
                  message: `Duplicate success action name: "${originalName}".`,
                  path: ['workflows', workflowIndex, 'steps', stepIndex, 'onSuccess', actionIndex],
                });
              }

              if (action.type === 'goto') {
                if (action.workflowId != null) {
                  // Check if workflowId is a runtime expression
                  if (action.workflowId.startsWith('$')) {
                    // Validate runtime expression and ensure <name> is in sourceDescriptions
                    if (
                      !arazzoRuntimeExpressionValidation(action.workflowId, target) ||
                      !(
                        target.sourceDescriptions?.some(
                          desc => desc.name === (action.workflowId ?? '').split('.')[1],
                        ) ?? false
                      )
                    ) {
                      results.push({
                        message: `"workflowId" "${action.workflowId}" is not a valid reference or does not exist in sourceDescriptions.`,
                        path: ['workflows', workflowIndex, 'steps', stepIndex, 'onSuccess', actionIndex],
                      });
                    }
                  } else {
                    // Validate against local workflows
                    if (!target.workflows.some(wf => wf.workflowId === action.workflowId)) {
                      results.push({
                        message: `"workflowId" "${action.workflowId}" does not exist within the local Arazzo Document workflows.`,
                        path: ['workflows', workflowIndex, 'steps', stepIndex, 'onSuccess', actionIndex],
                      });
                    }
                  }
                }

                if (action.stepId != null) {
                  if (!workflow.steps.some(s => s.stepId === action.stepId)) {
                    results.push({
                      message: `"stepId" "${action.stepId}" does not exist within the current workflow.`,
                      path: ['workflows', workflowIndex, 'steps', stepIndex, 'onSuccess', actionIndex],
                    });
                  }
                }

                if (action.workflowId != null && action.stepId != null) {
                  results.push({
                    message: `"workflowId" and "stepId" are mutually exclusive and cannot be specified together.`,
                    path: ['workflows', workflowIndex, 'steps', stepIndex, 'onSuccess', actionIndex],
                  });
                }
              }

              if (Array.isArray(action.criteria)) {
                action.criteria.forEach((criterion, criterionIndex) => {
                  const criterionResults = arazzoCriterionValidation(
                    criterion,
                    [
                      'workflows',
                      workflowIndex,
                      'steps',
                      stepIndex,
                      'onSuccess',
                      actionIndex,
                      'criteria',
                      criterionIndex,
                    ],
                    target,
                  );
                  results.push(...criterionResults);
                });
              }
            });
          }
        });
      }
    });
  }

  return results;
}
