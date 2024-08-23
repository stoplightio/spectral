import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';
import type { JsonPath } from '@stoplight/types';

export default createRulesetFunction<{ steps: Array<{ stepId?: string }> }, null>(
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
          },
        },
      },
    },
    options: null,
  },
  function arazzoStepIdUniqueness(targetVal, _opts) {
    const results: IFunctionResult[] = [];
    const stepIds = new Set<string>();

    if (!Array.isArray(targetVal.steps)) {
      return results;
    }

    targetVal.steps.forEach((step, index) => {
      const { stepId } = step;

      if (stepId == null) {
        // Handle case where stepId is missing or undefined
        results.push({
          message: `Step at index ${index} is missing a "stepId". Each step should have a unique "stepId".`,
          path: ['steps', index] as JsonPath,
        });
        return;
      }

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
