import arazzoStepSuccessCriteriaValidation from '../arazzoStepSuccessCriteriaValidation';
import type { RulesetFunctionContext } from '@stoplight/spectral-core';

type CriterionExpressionType = {
  type: 'jsonpath' | 'xpath';
  version: 'draft-goessner-dispatch-jsonpath-00' | 'xpath-30' | 'xpath-20' | 'xpath-10';
};

type Criterion = {
  context?: string;
  condition: string;
  type?: 'simple' | 'regex' | 'jsonpath' | 'xpath' | CriterionExpressionType;
};

type Step = {
  stepId: string;
  successCriteria?: Criterion[];
};

type Workflow = {
  workflowId: string;
  steps: Step[];
};

type ArazzoSpecification = {
  workflows: Workflow[];
  components?: object;
};

const runRule = (target: ArazzoSpecification, _contextOverrides: Partial<RulesetFunctionContext> = {}) => {
  return arazzoStepSuccessCriteriaValidation(target, null);
};

describe('arazzoStepSuccessCriteriaValidation', () => {
  test('should not report any errors for valid success criteria', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              successCriteria: [{ condition: '$statusCode == 200' }],
            },
          ],
        },
      ],
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for invalid context in success criteria', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              successCriteria: [{ context: 'invalidContext', condition: '$statusCode == 200' }],
            },
          ],
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `"context" contains an invalid runtime expression.`,
      path: ['workflows', 0, 'steps', 0, 'successCriteria', 0, 'context'],
    });
  });

  test('should report an error for missing condition in success criteria', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              successCriteria: [{ context: '$response.body', condition: '' }],
            },
          ],
        },
      ],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: `Missing or invalid "condition" in Criterion Object.`,
      path: ['workflows', 0, 'steps', 0, 'successCriteria', 0, 'condition'],
    });
  });
});
