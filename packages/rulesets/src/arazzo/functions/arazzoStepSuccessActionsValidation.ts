import type { IFunctionResult } from '@stoplight/spectral-core';
import getAllSuccessActions from './utils/getAllSuccessActions';
import arazzoCriterionValidation from './arazzoCriterionValidation';

type CriterionExpressionType = {
  type: 'jsonpath' | 'xpath';
  version: 'draft-goessner-dispatch-jsonpath-00' | 'xpath-30' | 'xpath-20' | 'xpath-10';
};

type Criterion = {
  context?: string;
  condition: string;
  type?: 'simple' | 'regex' | 'jsonpath' | 'xpath' | CriterionExpressionType;
};

type SuccessAction = {
  name: string;
  type: string;
  workflowId?: string;
  stepId?: string;
  criteria?: Criterion[];
};

type ReusableObject = {
  reference: string;
};

type Step = {
  stepId: string;
  onSuccess?: (SuccessAction | ReusableObject)[];
  workflowId?: string;
  operationId?: string;
  operationPath?: string;
};

type Workflow = {
  steps: Step[];
  successActions?: (SuccessAction | ReusableObject)[];
  components?: { successActions?: Record<string, SuccessAction> };
};

export default function arazzoStepSuccessActionsValidation(target: Workflow, _options: null): IFunctionResult[] {
  const results: IFunctionResult[] = [];
  const components = target.components?.successActions ?? {};

  target.steps.forEach((step, stepIndex) => {
    const resolvedActions = getAllSuccessActions(step, target, components);

    const seenNames: Set<string> = new Set();
    resolvedActions.forEach((action, actionIndex) => {
      if (seenNames.has(action.name)) {
        results.push({
          message: `"${action.name}" must be unique within the combined success actions.`,
          path: ['steps', stepIndex, 'onSuccess', actionIndex],
        });
      } else {
        seenNames.add(action.name);
      }

      if (action.type === 'goto') {
        if (action.workflowId != null && action.stepId != null) {
          results.push({
            message: `"workflowId" and "stepId" are mutually exclusive and cannot be specified together.`,
            path: ['steps', stepIndex, 'onSuccess', actionIndex],
          });
        }
      }

      if (action.criteria) {
        action.criteria.forEach((criterion, criterionIndex) => {
          const criterionResults = arazzoCriterionValidation(
            criterion,
            ['steps', stepIndex, 'onSuccess', actionIndex, 'criteria', criterionIndex],
            target,
          );
          results.push(...criterionResults);
        });
      }

      const maskedDuplicates = resolvedActions.filter(action => action.name.startsWith('masked-duplicate-'));
      if (maskedDuplicates.length > 0) {
        maskedDuplicates.forEach(action => {
          results.push({
            message: `Duplicate action: "${action.name.replace(
              'masked-duplicate-',
              '',
            )}" must be unique within the combined success actions.`,
            path: ['steps', stepIndex, 'onSuccess', resolvedActions.indexOf(action)],
          });
        });
      }
    });
  });

  return results;
}
