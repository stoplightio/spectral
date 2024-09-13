import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';
import type { JsonPath } from '@stoplight/types';
import arazzoRuntimeExpressionValidation from './arazzoRuntimeExpressionValidation';
import { ArazzoSpecification } from './types/arazzoTypes';

const OUTPUT_NAME_PATTERN = /^[a-zA-Z0-9.\-_]+$/;

export default createRulesetFunction<ArazzoSpecification, null>(
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
                type: 'object',
                additionalProperties: { type: 'string' },
              },
            },
          },
        },
      },
    },
    options: null,
  },
  function arazzoWorkflowOutputNamesValidation(targetVal, _opts) {
    const results: IFunctionResult[] = [];

    if (Array.isArray(targetVal.workflows)) {
      targetVal.workflows.forEach((workflow, workflowIndex) => {
        if (workflow.outputs && typeof workflow.outputs === 'object') {
          const seenOutputNames = new Set<string>();

          Object.entries(workflow.outputs).forEach(([outputName, outputValue], outputIndex) => {
            // Validate output name
            if (!OUTPUT_NAME_PATTERN.test(outputName)) {
              results.push({
                message: `"${outputName}" does not match the required pattern "^[a-zA-Z0-9.\\-_]+$".`,
                path: ['workflows', workflowIndex, 'outputs', outputName, outputIndex] as JsonPath,
              });
            }

            // Check for uniqueness within the workflow
            if (seenOutputNames.has(outputName)) {
              results.push({
                message: `"${outputName}" must be unique within the workflow outputs.`,
                path: ['workflows', workflowIndex, 'outputs', outputName, outputIndex] as JsonPath,
              });
            } else {
              seenOutputNames.add(outputName);
            }

            // Validate runtime expression
            if (
              !arazzoRuntimeExpressionValidation(
                outputValue,
                targetVal as unknown as ArazzoSpecification,
                workflowIndex,
              )
            ) {
              results.push({
                message: `"${outputValue}" is not a valid runtime expression.`,
                path: ['workflows', workflowIndex, 'outputs', outputName, outputIndex] as JsonPath,
              });
            }
          });
        }
      });
    }

    return results;
  },
);
