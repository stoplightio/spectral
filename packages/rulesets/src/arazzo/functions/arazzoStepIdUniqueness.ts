import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';
import type { JsonPath } from '@stoplight/types';

export default createRulesetFunction<{ steps: Array<{ stepId: string }> }, null>(
  {
    input: {
      type: 'object',
      properties: {
        steps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              stepId: {
                type: 'string',
              },
            },
            required: ['stepId'],
          },
        },
      },
    },
    options: null,
  },
  function arazzoStepIdUniqueness(targetVal, _) {
    const results: IFunctionResult[] = [];
    const stepIds = new Set<string>();

    targetVal.steps.forEach((step, index) => {
      const { stepId } = step;
      if (stepIds.has(stepId)) {
        results.push({
          message: `"stepId" must be unique within the workflow.`,
          path: ['steps', index, 'stepId'] as JsonPath,
        });
      } else {
        stepIds.add(stepId);
      }
    });

    return results;
  },
);
