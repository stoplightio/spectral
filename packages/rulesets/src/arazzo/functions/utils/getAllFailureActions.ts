import { isPlainObject } from '@stoplight/json';

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
  onFailure?: (FailureAction | ReusableObject)[];
};

type Workflow = {
  steps: Step[];
  onFailure?: (FailureAction | ReusableObject)[];
  components?: { failureActions?: Record<string, FailureAction> };
};

const resolveReusableFailureActions = (
  reusableObject: ReusableObject,
  components: Record<string, FailureAction>,
): FailureAction | undefined => {
  const refPath = reusableObject.reference.split('.').slice(1).join('.');
  return components[refPath];
};

function isFailureAction(action: unknown): action is FailureAction {
  if (typeof action === 'object' && action !== null) {
    const obj = action as Record<string, unknown>;
    return typeof obj.name === 'string' && typeof obj.type === 'string';
  }
  return false;
}
export default function getAllFailureActions(
  step: Step,
  workflow: Workflow,
  components: Record<string, FailureAction>,
): FailureAction[] {
  const resolvedFailureActions: FailureAction[] = [];
  const resolvedStepFailureActions: FailureAction[] = [];

  if (workflow.onFailure) {
    workflow.onFailure.forEach(action => {
      let actionToPush = action;

      if (isPlainObject(action) && 'reference' in action) {
        const resolvedAction = resolveReusableFailureActions(action, components);
        if (resolvedAction) {
          actionToPush = resolvedAction;
        }
      }

      if (isFailureAction(actionToPush)) {
        const isDuplicate = resolvedFailureActions.some(
          existingAction =>
            isFailureAction(existingAction) &&
            isFailureAction(actionToPush) &&
            existingAction.name === actionToPush.name,
        );

        if (isDuplicate) {
          actionToPush = {
            ...actionToPush,
            name: `masked-duplicate-${actionToPush.name}`,
          };
        }

        resolvedFailureActions.push(actionToPush);
      }
    });
  }

  //now process step onFailure actions into resolvedStepFailureActions and check for duplicates
  if (step.onFailure) {
    step.onFailure.forEach(action => {
      let actionToPush = action;

      if (isPlainObject(action) && 'reference' in action) {
        const resolvedAction = resolveReusableFailureActions(action, components);
        if (resolvedAction) {
          actionToPush = resolvedAction;
        }
      }

      if (isFailureAction(actionToPush)) {
        const isDuplicate = resolvedStepFailureActions.some(
          existingAction =>
            isFailureAction(existingAction) &&
            isFailureAction(actionToPush) &&
            existingAction.name === actionToPush.name,
        );

        if (isDuplicate) {
          actionToPush = {
            ...actionToPush,
            name: `masked-duplicate-${actionToPush.name}`,
          };
        }

        resolvedStepFailureActions.push(actionToPush);
      }
    });
  }

  //update below to process the resolvedStepFailureActions and overwrite duplicates in resolvedFailureActions
  resolvedStepFailureActions.forEach(action => {
    const existingActionIndex = resolvedFailureActions.findIndex(a => a.name === action.name);
    if (existingActionIndex !== -1) {
      resolvedFailureActions[existingActionIndex] = action;
    } else {
      resolvedFailureActions.push(action);
    }
  });

  return resolvedFailureActions;
}
