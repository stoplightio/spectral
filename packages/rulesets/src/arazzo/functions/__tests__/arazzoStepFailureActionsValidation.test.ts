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

type CriterionExpressionType = {
  type: 'jsonpath' | 'xpath';
  version: 'draft-goessner-dispatch-jsonpath-00' | 'xpath-30' | 'xpath-20' | 'xpath-10';
};

type Criterion = {
  context?: string;
  condition: string;
  type?: 'simple' | 'regex' | 'jsonpath' | 'xpath' | CriterionExpressionType;
};

type ReusableObject = {
  reference: string;
};

type Step = {
  stepId: string;
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
          stepId: 'step1',
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
          stepId: 'step1',
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
          stepId: 'step1',
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
          stepId: 'step1',
        },
      ],
      onFailure: [{ name: 'action1', type: 'end' }],
      components: { failureActions: {} },
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for missing condition in Criterion', () => {
    const results = runRule({
      steps: [
        {
          onFailure: [
            {
              name: 'action1',
              type: 'goto',
              stepId: 'step1',
              criteria: [
                {
                  context: '$response.body',
                  condition: '',
                },
              ], // Missing condition
            },
          ],
          stepId: 'step1',
        },
      ],
      components: { failureActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `Missing or invalid "condition" in Criterion Object.`,
      path: ['steps', 0, 'onFailure', 0, 'criteria', 0, 'condition'],
    });
  });

  test('should report an error for invalid regex pattern in Criterion condition', () => {
    const results = runRule({
      steps: [
        {
          onFailure: [
            {
              name: 'action1',
              type: 'goto',
              stepId: 'step1',
              criteria: [{ context: '$statusCode', condition: '^(200$', type: 'regex' }], // Invalid regex
            },
          ],
          stepId: 'step1',
        },
      ],
      components: { failureActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"condition" contains an invalid regex pattern.`,
      path: ['steps', 0, 'onFailure', 0, 'criteria', 0, 'condition'],
    });
  });

  test('should report an error for missing context when type is specified in Criterion', () => {
    const results = runRule({
      steps: [
        {
          onFailure: [
            {
              name: 'action1',
              type: 'goto',
              stepId: 'step1',
              criteria: [{ condition: '$response.body', type: 'jsonpath' }], // Missing context
            },
          ],
          stepId: 'step1',
        },
      ],
      components: { failureActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `A "context" must be specified for a Criterion Object with type "jsonpath".`,
      path: ['steps', 0, 'onFailure', 0, 'criteria', 0, 'context'],
    });
  });
});
