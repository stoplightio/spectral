import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';
import type { JsonPath } from '@stoplight/types';

const OUTPUT_NAME_PATTERN = /^[a-zA-Z0-9.\-_]+$/;

export default createRulesetFunction<
  { steps: Array<{ outputs?: [string, string][] }> }, // Updated type to accept array of entries
  null
>(
  {
    input: {
      type: 'object',
      properties: {
        steps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              outputs: {
                type: 'array', // Updated type to array
                items: {
                  type: 'array',
                  minItems: 2,
                  maxItems: 2,
                  items: [{ type: 'string' }, { type: 'string' }],
                },
              },
            },
          },
        },
      },
    },
    options: null,
  },
  function arazzoStepOutputNamesValidation(targetVal) {
    const results: IFunctionResult[] = [];

    targetVal.steps.forEach((step, stepIndex) => {
      if (step.outputs) {
        const seenOutputNames = new Set<string>();

        step.outputs.forEach(([outputName]) => {
          // Destructure entries directly
          if (!OUTPUT_NAME_PATTERN.test(outputName)) {
            results.push({
              message: `"${outputName}" does not match the required pattern "^[a-zA-Z0-9.\\-_]+$".`,
              path: ['steps', stepIndex, 'outputs', outputName] as JsonPath,
            });
          }

          if (seenOutputNames.has(outputName)) {
            results.push({
              message: `"${outputName}" must be unique within the step outputs.`,
              path: ['steps', stepIndex, 'outputs', outputName] as JsonPath,
            });
          } else {
            seenOutputNames.add(outputName);
          }
        });
      }
    });

    return results;
  },
);
