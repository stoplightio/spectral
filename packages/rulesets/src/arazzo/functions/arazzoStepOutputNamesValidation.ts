import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';
import type { JsonPath } from '@stoplight/types';
import arazzoRuntimeExpressionValidation from './arazzoRuntimeExpressionValidation';

const OUTPUT_NAME_PATTERN = /^[a-zA-Z0-9.\-_]+$/;

type Workflow = {
  steps: Step[];
};

type Step = {
  stepId: string;
  outputs?: { [key: string]: string };
};

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
  function arazzoStepOutputNamesValidation(targetVal, _opts, context) {
    const results: IFunctionResult[] = [];

    targetVal.steps.forEach((step, stepIndex) => {
      if (step.outputs) {
        const seenOutputNames = new Set<string>();

        step.outputs.forEach(([outputName, outputValue]) => {
          // Validate output name
          if (!OUTPUT_NAME_PATTERN.test(outputName)) {
            results.push({
              message: `"${outputName}" does not match the required pattern "^[a-zA-Z0-9.\\-_]+$".`,
              path: ['steps', stepIndex, 'outputs', outputName] as JsonPath,
            });
          }

          // Check for uniqueness within the step
          if (seenOutputNames.has(outputName)) {
            results.push({
              message: `"${outputName}" must be unique within the step outputs.`,
              path: ['steps', stepIndex, 'outputs', outputName] as JsonPath,
            });
          } else {
            seenOutputNames.add(outputName);
          }

          // Validate runtime expression
          if (!arazzoRuntimeExpressionValidation(outputValue, context.document as unknown as Workflow)) {
            results.push({
              message: `"${outputValue}" is not a valid runtime expression.`,
              path: ['steps', stepIndex, 'outputs', outputName] as JsonPath,
            });
          }
        });
      }
    });

    return results;
  },
);
