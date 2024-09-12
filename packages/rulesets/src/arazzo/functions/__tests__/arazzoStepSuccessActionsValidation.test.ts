import arazzoStepSuccessActionsValidation from '../arazzoStepSuccessActionsValidation';
import type { RulesetFunctionContext } from '@stoplight/spectral-core';
import { ArazzoSpecification } from '../types/arazzoTypes';

const runRule = (target: ArazzoSpecification, _contextOverrides: Partial<RulesetFunctionContext> = {}) => {
  return arazzoStepSuccessActionsValidation(target, null);
};

describe('validateSuccessActions', () => {
  test('should not report any errors for valid and unique success actions', () => {
    const results = runRule({
      workflows: [
        {
          steps: [
            {
              onSuccess: [
                { name: 'action1', type: 'goto', stepId: 'step1' },
                { name: 'action2', type: 'end' },
              ],
              stepId: 'step1',
            },
          ],
          workflowId: 'workflow1',
        },
      ],
      components: { successActions: {} },
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for duplicate success actions within the same step', () => {
    const results = runRule({
      workflows: [
        {
          steps: [
            {
              onSuccess: [
                { name: 'action1', type: 'goto', stepId: 'step1' },
                { name: 'action1', type: 'end' },
              ],
              stepId: 'step1',
            }, // Duplicate action name
          ],
          workflowId: 'workflow1',
        },
      ],
      components: { successActions: {} },
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      message: `"action1" must be unique within the combined success actions.`,
      path: ['workflows', 0, 'steps', 0, 'onSuccess', 1],
    });
  });

  test('should report an error for mutually exclusive workflowId and stepId', () => {
    const results = runRule({
      workflows: [
        {
          steps: [
            {
              onSuccess: [{ name: 'action1', type: 'goto', stepId: 'step1', workflowId: 'workflow1' }],
              stepId: 'step1',
            },
          ],
          workflowId: 'workflow1',
        },
      ],
      components: { successActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"workflowId" and "stepId" are mutually exclusive and cannot be specified together.`,
      path: ['workflows', 0, 'steps', 0, 'onSuccess', 0],
    });
  });

  test('should override workflow level success action with step level success action', () => {
    const results = runRule({
      workflows: [
        {
          steps: [
            {
              onSuccess: [{ name: 'action1', type: 'goto', stepId: 'step1' }],
              stepId: 'step1',
            },
          ],
          successActions: [{ name: 'action1', type: 'end' }],
          workflowId: 'workflow1',
        },
      ],
      components: { successActions: {} },
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for an invalid runtime expression in a reusable action reference', () => {
    const results = runRule({
      workflows: [
        {
          steps: [
            {
              onSuccess: [{ reference: 'invalidExpression' }],
              stepId: 'step1',
            },
          ],
          workflowId: 'workflow1',
        },
      ],
      components: {
        successActions: {
          completeWorkflow: {
            name: 'finish',
            type: 'end',
          },
        },
      },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: 'Invalid runtime expression for reusable action reference: "invalidExpression".',
      path: ['workflows', 0, 'steps', 0, 'onSuccess', 0],
    });
  });

  test('should report an error for non-existing reusable action reference', () => {
    const results = runRule({
      workflows: [
        {
          steps: [
            {
              onSuccess: [{ reference: '$components.successActions.nonExistingAction' }],
              stepId: 'step1',
            },
          ],
          workflowId: 'workflow1',
        },
      ],
      components: {
        successActions: {
          completeWorkflow: {
            name: 'finish',
            type: 'end',
          },
        },
      },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message:
        'Invalid runtime expression for reusable action reference: "$components.successActions.nonExistingAction".',
      path: ['workflows', 0, 'steps', 0, 'onSuccess', 0],
    });
  });

  test('should report an error for missing condition in Criterion', () => {
    const results = runRule({
      workflows: [
        {
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
          workflowId: 'workflow1',
        },
      ],
      components: { successActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `Missing or invalid "condition" in Criterion Object.`,
      path: ['workflows', 0, 'steps', 0, 'onSuccess', 0, 'criteria', 0, 'condition'],
    });
  });

  test('should report an error for invalid regex pattern in Criterion condition', () => {
    const results = runRule({
      workflows: [
        {
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
          workflowId: 'workflow1',
        },
      ],
      components: { successActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"condition" contains an invalid regex pattern.`,
      path: ['workflows', 0, 'steps', 0, 'onSuccess', 0, 'criteria', 0, 'condition'],
    });
  });

  test('should report an error for missing context when type is specified in Criterion', () => {
    const results = runRule({
      workflows: [
        {
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
          workflowId: 'workflow1',
        },
      ],
      components: { successActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `A "context" must be specified for a Criterion Object with type "jsonpath".`,
      path: ['workflows', 0, 'steps', 0, 'onSuccess', 0, 'criteria', 0, 'context'],
    });
  });

  test('should report an error for a non-existing stepId in success action', () => {
    const results = runRule({
      workflows: [
        {
          steps: [
            {
              onSuccess: [{ name: 'action1', type: 'goto', stepId: 'nonExistentStep' }],
              stepId: 'step1',
            },
          ],
          workflowId: 'workflow1',
        },
      ],
      components: { successActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"stepId" "nonExistentStep" does not exist within the current workflow.`,
      path: ['workflows', 0, 'steps', 0, 'onSuccess', 0],
    });
  });

  test('should report an error for an invalid workflowId expression in success action', () => {
    const results = runRule({
      workflows: [
        {
          steps: [
            {
              onSuccess: [{ name: 'action1', type: 'goto', workflowId: 'invalidWorkflowIdExpression' }],
              stepId: 'step1',
            },
          ],
          workflowId: 'workflow1',
        },
      ],
      components: { successActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"workflowId" "invalidWorkflowIdExpression" does not exist within the local Arazzo Document workflows.`,
      path: ['workflows', 0, 'steps', 0, 'onSuccess', 0],
    });
  });

  test('should not report an error for a valid workflowId expression in success action', () => {
    const results = runRule({
      workflows: [
        {
          steps: [
            {
              onSuccess: [{ name: 'action1', type: 'goto', workflowId: '$sourceDescriptions.pet-coupons.workflow1' }],
              stepId: 'step1',
            },
          ],
          workflowId: 'workflow1',
        },
      ],
      sourceDescriptions: [{ name: 'pet-coupons', url: 'some-url', type: 'openapi' }],
      components: { successActions: {} },
    });

    expect(results).toHaveLength(0);
  });
});
