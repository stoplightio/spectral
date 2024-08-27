import { isPlainObject } from '@stoplight/json';
import arazzoRuntimeExpressionValidation from '../arazzoRuntimeExpressionValidation';
import { ArazzoSpecification, Workflow, Step, ReusableObject, FailureAction } from '../types/arazzoTypes';

function isFailureAction(action: unknown): action is FailureAction {
  return typeof action === 'object' && action !== null && 'name' in action && 'type' in action;
}

function processReusableAction(action: ReusableObject, arazzoSpec: ArazzoSpecification): FailureAction {
  const actionName = action.reference;

  // Ensure the reference starts with $components.failureActions
  if (!action.reference.startsWith('$components.failureActions.')) {
    return { name: `masked-invalid-reusable-failure-action-reference-${actionName}`, type: '' };
  }

  // Validate the reference right here, ensuring it resolves
  if (!arazzoRuntimeExpressionValidation(action.reference, arazzoSpec)) {
    return { name: `masked-invalid-reusable-failure-action-reference-${actionName}`, type: '' };
  }

  // Further processing with extracted name
  const refPath = action.reference.replace('$components.failureActions.', '');
  const resolvedAction = arazzoSpec.components?.failureActions?.[refPath];

  if (!resolvedAction) {
    return { name: `masked-unresolved-failure-action-reference-${actionName}`, type: '' };
  }

  return resolvedAction;
}

export default function getAllFailureActions(
  step: Step,
  workflow: Workflow,
  arazzoSpec: ArazzoSpecification,
): FailureAction[] {
  const resolvedFailureActions: FailureAction[] = [];
  const resolvedStepFailureActions: FailureAction[] = [];

  const resolveActions = (actions: (FailureAction | ReusableObject)[], targetArray: FailureAction[]): void => {
    actions.forEach(action => {
      let actionToPush: FailureAction;

      if (isPlainObject(action) && 'reference' in action) {
        actionToPush = processReusableAction(action, arazzoSpec);
      } else {
        actionToPush = action;
      }

      if (isFailureAction(actionToPush)) {
        const isDuplicate = targetArray.some(existingAction => existingAction.name === actionToPush.name);

        if (isDuplicate) {
          actionToPush = {
            ...actionToPush,
            name: `masked-duplicate-${actionToPush.name}`,
          };
        }

        targetArray.push(actionToPush);
      }
    });
  };

  // Process workflow-level failure actions
  if (workflow.failureActions) {
    resolveActions(workflow.failureActions, resolvedFailureActions);
  }

  // Process step-level failure actions
  if (step.onFailure) {
    resolveActions(step.onFailure, resolvedStepFailureActions);
  }

  // Merge step actions into workflow actions, overriding duplicates
  resolvedStepFailureActions.forEach(action => {
    const existingActionIndex = resolvedFailureActions.findIndex(a => a.name === action.name);
    if (existingActionIndex !== -1) {
      resolvedFailureActions[existingActionIndex] = action; // Override workflow action with step action
    } else {
      resolvedFailureActions.push(action);
    }
  });

  return resolvedFailureActions;
}
