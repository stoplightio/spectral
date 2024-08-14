import arazzoStepFailureActionsValidation from '../arazzoStepFailureActionsValidation';
import type { RulesetFunctionContext } from '@stoplight/spectral-core';

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

const runRule = (target: Workflow, _contextOverrides: Partial<RulesetFunctionContext> = {}) => {
  return arazzoStepFailureActionsValidation(target, null);
};

describe('validateFailureActions', () => {
  test('should not report any errors for valid and unique failure actions', () => {
    const results = runRule({
      steps: [
        {
          onFailure: [
            { name: 'action1', type: 'goto', stepId: 'step1' },
            { name: 'action2', type: 'end' },
          ],
        },
      ],
      components: { failureActions: {} },
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for duplicate failure actions within the same step', () => {
    const results = runRule({
      steps: [
        {
          onFailure: [
            { name: 'action1', type: 'goto', stepId: 'step1' },
            { name: 'action1', type: 'end' },
          ],
        }, // Duplicate action name
      ],
      components: { failureActions: {} },
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      message: `Duplicate action: "action1" must be unique within the combined failure actions.`,
      path: ['steps', 0, 'onFailure', 1],
    });
  });

  test('should report an error for mutually exclusive workflowId and stepId', () => {
    const results = runRule({
      steps: [
        {
          onFailure: [{ name: 'action1', type: 'goto', stepId: 'step1', workflowId: 'workflow1' }],
        },
      ],
      components: { failureActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"workflowId" and "stepId" are mutually exclusive and cannot be specified together.`,
      path: ['steps', 0, 'onFailure', 0],
    });
  });

  test('should override workflow level onFailure action with step level onFailure action', () => {
    const results = runRule({
      steps: [
        {
          onFailure: [{ name: 'action1', type: 'goto', stepId: 'step1' }],
        },
      ],
      onFailure: [{ name: 'action1', type: 'end' }],
      components: { failureActions: {} },
    });

    expect(results).toHaveLength(0);
  });
});
