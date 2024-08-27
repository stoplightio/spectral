import arazzoStepFailureActionsValidation from '../arazzoStepFailureActionsValidation';
import type { RulesetFunctionContext } from '@stoplight/spectral-core';
import { ArazzoSpecification } from '../types/arazzoTypes';

const runRule = (target: ArazzoSpecification, _contextOverrides: Partial<RulesetFunctionContext> = {}) => {
  return arazzoStepFailureActionsValidation(target, null);
};

describe('validateFailureActions', () => {
  test('should not report any errors for valid and unique failure actions', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              onFailure: [
                { name: 'action1', type: 'goto', stepId: 'step1' },
                { name: 'action2', type: 'end' },
              ],
            },
          ],
        },
      ],
      components: {
        failureActions: {
          allDone: {
            name: 'finishWorkflow',
            type: 'end',
          },
        },
      },
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for duplicate failure actions within the same step', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              onFailure: [
                { name: 'action1', type: 'goto', stepId: 'step1' },
                { name: 'action1', type: 'end' },
              ],
            },
          ],
        },
      ],
      components: {
        failureActions: {},
      },
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      message: `"action1" must be unique within the combined failure actions.`,
      path: ['workflows', 0, 'steps', 0, 'onFailure', 1],
    });
  });

  test('should report an error for mutually exclusive workflowId and stepId', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              onFailure: [{ name: 'action1', type: 'goto', stepId: 'step1', workflowId: 'workflow1' }],
            },
          ],
        },
      ],
      components: { failureActions: {} },
    });

    expect(results).toHaveLength(1); // The second failure should be added based on the conflict between workflowId and stepId
    expect(results[0]).toMatchObject({
      message: `"workflowId" and "stepId" are mutually exclusive and cannot be specified together.`,
      path: ['workflows', 0, 'steps', 0, 'onFailure', 0],
    });
  });

  test('should override workflow level onFailure action with step level onFailure action', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          failureActions: [{ name: 'action1', type: 'end' }],
          steps: [
            {
              stepId: 'step1',
              onFailure: [{ name: 'action1', type: 'goto', stepId: 'step1' }],
            },
          ],
        },
      ],
      components: { failureActions: {} },
    });

    expect(results).toHaveLength(0); // No errors as step level onFailure overrides workflow level action
  });

  test('should report an error for missing condition in Criterion', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
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
                  ],
                },
              ],
            },
          ],
        },
      ],
      components: { failureActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `Missing or invalid "condition" in Criterion Object.`,
      path: ['workflows', 0, 'steps', 0, 'onFailure', 0, 'criteria', 0, 'condition'],
    });
  });

  test('should report an error for invalid regex pattern in Criterion condition', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              onFailure: [
                {
                  name: 'action1',
                  type: 'goto',
                  stepId: 'step1',
                  criteria: [{ context: '$statusCode', condition: '^(200$', type: 'regex' }],
                },
              ],
            },
          ],
        },
      ],
      components: { failureActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"condition" contains an invalid regex pattern.`,
      path: ['workflows', 0, 'steps', 0, 'onFailure', 0, 'criteria', 0, 'condition'],
    });
  });

  test('should report an error for missing context when type is specified in Criterion', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              onFailure: [
                {
                  name: 'action1',
                  type: 'goto',
                  stepId: 'step1',
                  criteria: [{ condition: '$response.body', type: 'jsonpath' }],
                },
              ],
            },
          ],
        },
      ],
      components: { failureActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `A "context" must be specified for a Criterion Object with type "jsonpath".`,
      path: ['workflows', 0, 'steps', 0, 'onFailure', 0, 'criteria', 0, 'context'],
    });
  });

  test('should not report any errors for valid reference to a failure action in components', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              onFailure: [{ reference: '$components.failureActions.refreshToken' }],
            },
          ],
        },
      ],
      components: {
        failureActions: {
          refreshToken: {
            name: 'refreshExpiredToken',
            type: 'retry',
            retryAfter: 1,
            retryLimit: 5,
          },
        },
      },
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for a non-existing failure action reference in components', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'apply-coupon',
          steps: [
            {
              stepId: 'find-pet',
              onFailure: [
                { reference: '$components.failureActions.foo' }, // This action doesn't exist
                { name: 'retryStep', type: 'retry', retryAfter: 1, retryLimit: 5 },
              ],
            },
          ],
        },
      ],
      components: {
        failureActions: {
          refreshToken: {
            name: 'refreshExpiredToken',
            type: 'retry',
            retryAfter: 1,
            retryLimit: 5,
            workflowId: 'refreshTokenWorkflowId',
          },
        },
      },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: 'Invalid runtime expression for reusable action reference: "$components.failureActions.foo".',
      path: ['workflows', 0, 'steps', 0, 'onFailure', 0],
    });
  });

  test('should report an error for an invalid runtime expression in a reusable failure action reference', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              onFailure: [
                { reference: 'invalidExpression' },
                { name: 'retryStep', type: 'retry', retryAfter: 1, retryLimit: 5 },
              ],
            },
          ],
        },
      ],
      components: {
        failureActions: {
          refreshToken: {
            name: 'refreshExpiredToken',
            type: 'retry',
            retryAfter: 1,
            retryLimit: 5,
            workflowId: 'refreshTokenWorkflowId',
          },
        },
      },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: 'Invalid runtime expression for reusable action reference: "invalidExpression".',
      path: ['workflows', 0, 'steps', 0, 'onFailure', 0],
    });
  });

  test('should report an error for a reference to a non-existing failure action in components', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              onFailure: [{ reference: '$components.failureActions.nonExistingAction' }],
            },
          ],
        },
      ],
      components: {
        failureActions: {
          refreshToken: {
            name: 'refreshExpiredToken',
            type: 'retry',
            retryAfter: 1,
            retryLimit: 5,
            workflowId: 'refreshTokenWorkflowId',
          },
        },
      },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message:
        'Invalid runtime expression for reusable action reference: "$components.failureActions.nonExistingAction".',
      path: ['workflows', 0, 'steps', 0, 'onFailure', 0],
    });
  });

  test('should report an error when stepId in failure action does not exist in the current workflow', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              onFailure: [
                { name: 'action1', type: 'goto', stepId: 'nonExistingStep' }, // This stepId doesn't exist
              ],
            },
          ],
        },
      ],
      components: { failureActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"stepId" "nonExistingStep" does not exist within the current workflow.`,
      path: ['workflows', 0, 'steps', 0, 'onFailure', 0],
    });
  });

  test('should report an error when workflowId is a runtime expression that does not exist in sourceDescriptions', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              onFailure: [
                { name: 'action1', type: 'goto', workflowId: '$sourceDescriptions.invalidName.invalidWorkflow' }, // Invalid name in sourceDescriptions
              ],
            },
          ],
        },
      ],
      sourceDescriptions: [{ name: 'validName', url: './valid.url', type: 'openapi' }],
      components: { failureActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"workflowId" "$sourceDescriptions.invalidName.invalidWorkflow" is not a valid reference or does not exist in sourceDescriptions.`,
      path: ['workflows', 0, 'steps', 0, 'onFailure', 0],
    });
  });

  test('should report an error when workflowId in failure action does not exist within local workflows', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              onFailure: [
                { name: 'action1', type: 'goto', workflowId: 'nonExistingWorkflow' }, // This workflowId doesn't exist
              ],
            },
          ],
        },
      ],
      components: { failureActions: {} },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"workflowId" "nonExistingWorkflow" does not exist within the local Arazzo Document workflows.`,
      path: ['workflows', 0, 'steps', 0, 'onFailure', 0],
    });
  });

  test('should not report an error for valid stepId and workflowId references in failure actions', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            { stepId: 'step1' },
            {
              stepId: 'step2',
              onFailure: [
                { name: 'action1', type: 'goto', stepId: 'step1' }, // Valid stepId
                { name: 'action2', type: 'goto', workflowId: 'workflow2' }, // Valid workflowId
              ],
            },
          ],
        },
        {
          workflowId: 'workflow2',
          steps: [{ stepId: 'step1' }],
        },
      ],
      components: { failureActions: {} },
    });

    expect(results).toHaveLength(0); // No errors for valid references
  });

  test('should report an error when workflowId and stepId are used together in a failure action', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              onFailure: [
                { name: 'action1', type: 'goto', workflowId: 'workflow2', stepId: 'step1' }, // Both workflowId and stepId are used
              ],
            },
          ],
        },
      ],
      components: { failureActions: {} },
    });

    expect(results).toHaveLength(2);
    expect(results[1]).toMatchObject({
      message: `"workflowId" and "stepId" are mutually exclusive and cannot be specified together.`,
      path: ['workflows', 0, 'steps', 0, 'onFailure', 0],
    });
  });
});
