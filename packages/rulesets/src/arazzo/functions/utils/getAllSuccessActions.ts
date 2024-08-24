import { isPlainObject } from '@stoplight/json';
import arazzoRuntimeExpressionValidation from '../arazzoRuntimeExpressionValidation';

type ArazzoSpecification = {
  workflows: Workflow[];
  sourceDescriptions?: SourceDescription[];
  components?: {
    parameters?: Record<string, Parameter>;
    successActions?: Record<string, SuccessAction>;
    failureActions?: Record<string, FailureAction>;
    [key: string]: unknown;
  };
};

type Parameter = {
  name: string;
  in?: string;
  value?: unknown;
};

type SourceDescription = {
  name: string;
  url: string;
  type?: string;
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
  retryAfter?: number;
  retryLimit?: number;
  criteria?: Criterion[];
};

type Criterion = {
  condition: string;
};

type ReusableObject = {
  reference: string;
};

type Step = {
  stepId: string;
  onSuccess?: (SuccessAction | ReusableObject)[];
};

type Workflow = {
  workflowId: string;
  steps: Step[];
  successActions?: (SuccessAction | ReusableObject)[];
};

const resolveReusableSuccessActions = (
  reusableObject: ReusableObject,
  arazzoSpec: ArazzoSpecification,
): SuccessAction | undefined => {
  const refPath = reusableObject.reference.replace('$components.successActions.', '');
  return arazzoSpec.components?.successActions?.[refPath];
};

function isSuccessAction(action: unknown): action is SuccessAction {
  return typeof action === 'object' && action !== null && 'name' in action && 'type' in action;
}

export default function getAllSuccessActions(
  step: Step,
  workflow: Workflow,
  arazzoSpec: ArazzoSpecification,
): SuccessAction[] {
  const resolvedSuccessActions: SuccessAction[] = [];
  const resolvedStepSuccessActions: SuccessAction[] = [];

  const processReusableAction = (action: ReusableObject): SuccessAction => {
    const actionName = action.reference;

    if (!arazzoRuntimeExpressionValidation(action.reference, arazzoSpec)) {
      return { name: `masked-invalid-reusable-success-action-reference-${actionName}`, type: '' };
    }

    const resolvedAction = resolveReusableSuccessActions(action, arazzoSpec);
    if (!resolvedAction) {
      return { name: `masked-non-existing-success-action-reference-${actionName}`, type: '' };
    }

    return resolvedAction;
  };

  const resolveActions = (actions: (SuccessAction | ReusableObject)[], targetArray: SuccessAction[]): void => {
    actions.forEach(action => {
      let actionToPush: SuccessAction;

      if (isPlainObject(action) && 'reference' in action) {
        actionToPush = processReusableAction(action);
      } else {
        actionToPush = action;
      }

      if (isSuccessAction(actionToPush)) {
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

  // Process workflow-level success actions
  if (workflow.successActions) {
    resolveActions(workflow.successActions, resolvedSuccessActions);
  }

  // Process step-level success actions
  if (step.onSuccess) {
    resolveActions(step.onSuccess, resolvedStepSuccessActions);
  }

  // Merge step actions into workflow actions, overriding duplicates
  resolvedStepSuccessActions.forEach(action => {
    const existingActionIndex = resolvedSuccessActions.findIndex(a => a.name === action.name);
    if (existingActionIndex !== -1) {
      resolvedSuccessActions[existingActionIndex] = action; // Override workflow action with step action
    } else {
      resolvedSuccessActions.push(action);
    }
  });

  return resolvedSuccessActions;
}
