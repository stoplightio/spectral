import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';
import type { JsonPath } from '@stoplight/types';

const OUTPUT_NAME_PATTERN = /^[a-zA-Z0-9.\-_]+$/;

export default createRulesetFunction<
  { workflows: Array<{ outputs?: [string, string][] }> }, // Accept array of entries for workflow outputs
  null
>(
  {
    input: {
      type: 'object',
      properties: {
        workflows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              outputs: {
                type: 'array',
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
  function arazzoWorkflowOutputNamesValidation(targetVal) {
    const results: IFunctionResult[] = [];

    targetVal.workflows.forEach((workflow, workflowIndex) => {
      if (workflow.outputs) {
        const seenOutputNames = new Set<string>();

        workflow.outputs.forEach(([outputName]) => {
          if (!OUTPUT_NAME_PATTERN.test(outputName)) {
            results.push({
              message: `"${outputName}" does not match the required pattern "^[a-zA-Z0-9.\\-_]+$".`,
              path: ['workflows', workflowIndex, 'outputs', outputName] as JsonPath,
            });
          }

          if (seenOutputNames.has(outputName)) {
            results.push({
              message: `"${outputName}" must be unique within the workflow outputs.`,
              path: ['workflows', workflowIndex, 'outputs', outputName] as JsonPath,
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
