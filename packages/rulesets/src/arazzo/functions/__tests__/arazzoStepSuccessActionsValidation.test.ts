import arazzoStepSuccessActionsValidation from '../arazzoStepSuccessActionsValidation';
import type { RulesetFunctionContext } from '@stoplight/spectral-core';

type SuccessAction = {
  name: string;
  type: string;
  workflowId?: string;
  stepId?: string;
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
          stepId: 'step1',
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
          stepId: 'step1',
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
          stepId: 'step1',
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
          stepId: 'step1',
        },
      ],
      successActions: [{ name: 'action1', type: 'end' }],
      components: { successActions: {} },
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for missing condition in Criterion', () => {
    const results = runRule({
      steps: [
        {
          onSuccess: [
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
      components: { successActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `Missing or invalid "condition" in Criterion Object.`,
      path: ['steps', 0, 'onSuccess', 0, 'criteria', 0, 'condition'],
    });
  });

  test('should report an error for invalid regex pattern in Criterion condition', () => {
    const results = runRule({
      steps: [
        {
          onSuccess: [
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
      components: { successActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"condition" contains an invalid regex pattern.`,
      path: ['steps', 0, 'onSuccess', 0, 'criteria', 0, 'condition'],
    });
  });

  test('should report an error for missing context when type is specified in Criterion', () => {
    const results = runRule({
      steps: [
        {
          onSuccess: [
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
      components: { successActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `A "context" must be specified for a Criterion Object with type "jsonpath".`,
      path: ['steps', 0, 'onSuccess', 0, 'criteria', 0, 'context'],
    });
  });
});
