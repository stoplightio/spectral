import { isPlainObject } from '@stoplight/json';

type SuccessAction = {
  name: string;
  type: string;
  workflowId?: string;
  stepId?: string;
  criteria?: Criterion[];
};

type Criterion = {
  condition: string;
};

type ReusableObject = {
  reference: string;
};

type Step = {
  onSuccess?: (SuccessAction | ReusableObject)[];
};

type Workflow = {
  steps: Step[];
  successActions?: (SuccessAction | ReusableObject)[];
  components?: { successActions?: Record<string, SuccessAction> };
};

const resolveReusableSuccessActions = (
  reusableObject: ReusableObject,
  components: Record<string, SuccessAction>,
): SuccessAction | undefined => {
  const refPath = reusableObject.reference.split('.').slice(1).join('.');
  return components[refPath];
};

function isSuccessAction(action: unknown): action is SuccessAction {
  if (typeof action === 'object' && action !== null) {
    const obj = action as Record<string, unknown>;
    return typeof obj.name === 'string' && typeof obj.type === 'string';
  }
  return false;
}

export default function getAllSuccessActions(
  step: Step,
  workflow: Workflow,
  components: Record<string, SuccessAction>,
): SuccessAction[] {
  const resolvedSuccessActions: SuccessAction[] = [];
  const resolvedStepSuccessActions: SuccessAction[] = [];

  if (workflow.successActions) {
    workflow.successActions.forEach(action => {
      let actionToPush = action;

      if (isPlainObject(action) && 'reference' in action) {
        const resolvedAction = resolveReusableSuccessActions(action, components);
        if (resolvedAction) {
          actionToPush = resolvedAction;
        }
      }

      if (isSuccessAction(actionToPush)) {
        const isDuplicate = resolvedSuccessActions.some(
          existingAction =>
            isSuccessAction(existingAction) &&
            isSuccessAction(actionToPush) &&
            existingAction.name === actionToPush.name,
        );

        if (isDuplicate) {
          actionToPush = {
            ...actionToPush,
            name: `masked-duplicate-${actionToPush.name}`,
          };
        }

        resolvedSuccessActions.push(actionToPush);
      }
    });
  }

  if (step.onSuccess) {
    step.onSuccess.forEach(action => {
      let actionToPush = action;

      if (isPlainObject(action) && 'reference' in action) {
        const resolvedAction = resolveReusableSuccessActions(action, components);
        if (resolvedAction) {
          actionToPush = resolvedAction;
        }
      }

      if (isSuccessAction(actionToPush)) {
        const isDuplicate = resolvedStepSuccessActions.some(
          existingAction =>
            isSuccessAction(existingAction) &&
            isSuccessAction(actionToPush) &&
            existingAction.name === actionToPush.name,
        );

        if (isDuplicate) {
          actionToPush = {
            ...actionToPush,
            name: `masked-duplicate-${actionToPush.name}`,
          };
        }

        resolvedStepSuccessActions.push(actionToPush);
      }
    });
  }

  resolvedStepSuccessActions.forEach(action => {
    const existingActionIndex = resolvedSuccessActions.findIndex(a => a.name === action.name);
    if (existingActionIndex !== -1) {
      resolvedSuccessActions[existingActionIndex] = action;
    } else {
      resolvedSuccessActions.push(action);
    }
  });

  return resolvedSuccessActions;
}
