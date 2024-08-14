import arazzoStepSuccessActionsValidation from '../arazzoStepSuccessActionsValidation';
import type { RulesetFunctionContext } from '@stoplight/spectral-core';

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

const runRule = (target: Workflow, _contextOverrides: Partial<RulesetFunctionContext> = {}) => {
  return arazzoStepSuccessActionsValidation(target, null);
};

describe('validateSuccessActions', () => {
  test('should not report any errors for valid and unique success actions', () => {
    const results = runRule({
      steps: [
        {
          onSuccess: [
            { name: 'action1', type: 'goto', stepId: 'step1' },
            { name: 'action2', type: 'end' },
          ],
        },
      ],
      components: { successActions: {} },
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for duplicate success actions within the same step', () => {
    const results = runRule({
      steps: [
        {
          onSuccess: [
            { name: 'action1', type: 'goto', stepId: 'step1' },
            { name: 'action1', type: 'end' },
          ],
        }, // Duplicate action name
      ],
      components: { successActions: {} },
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      message: `Duplicate action: "action1" must be unique within the combined success actions.`,
      path: ['steps', 0, 'onSuccess', 1],
    });
  });

  test('should report an error for mutually exclusive workflowId and stepId', () => {
    const results = runRule({
      steps: [
        {
          onSuccess: [{ name: 'action1', type: 'goto', stepId: 'step1', workflowId: 'workflow1' }],
        },
      ],
      components: { successActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"workflowId" and "stepId" are mutually exclusive and cannot be specified together.`,
      path: ['steps', 0, 'onSuccess', 0],
    });
  });

  test('should override workflow level success action with step level success action', () => {
    const results = runRule({
      steps: [
        {
          onSuccess: [{ name: 'action1', type: 'goto', stepId: 'step1' }],
        },
      ],
      successActions: [{ name: 'action1', type: 'end' }],
      components: { successActions: {} },
    });

    expect(results).toHaveLength(0);
  });
});
