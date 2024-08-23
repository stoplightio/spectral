import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';
import type { JsonPath } from '@stoplight/types';
import arazzoRuntimeExpressionValidation from './arazzoRuntimeExpressionValidation';

const OUTPUT_NAME_PATTERN = /^[a-zA-Z0-9.\-_]+$/;

type ArazzoSpecification = {
  workflows: Workflow[];
  sourceDescriptions?: SourceDescription[];
  components?: {
    parameters?: Record<string, unknown>;
    successActions?: Record<string, SuccessAction>;
    failureActions?: Record<string, FailureAction>;
    [key: string]: unknown;
  };
};

type SourceDescription = {
  name: string;
  url: string;
  type?: string;
};

type SuccessAction = {
  name: string;
  type: string;
  workflowId?: string;
  stepId?: string;
  criteria?: Criterion[];
};

type FailureAction = {
  name: string;
  type: string;
  workflowId?: string;
  stepId?: string;
  criteria?: Criterion[];
};
type Workflow = {
  workflowId: string;
  steps: Step[];
  outputs?: Record<string, string>;
};

type Step = {
  stepId: string;
  outputs?: Record<string, string>;
};

type Criterion = {
  context?: string;
  condition: string;
  type?: 'simple' | 'regex' | 'jsonpath' | 'xpath' | CriterionExpressionType;
};

type CriterionExpressionType = {
  type: 'jsonpath' | 'xpath';
  version: string;
};

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
              steps: {
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
        },
      },
    },
    options: null,
  },
  function arazzoStepOutputNamesValidation(targetVal, _opts) {
    const results: IFunctionResult[] = [];

    if (!Array.isArray(targetVal.workflows)) {
      return results;
    }

    targetVal.workflows.forEach((workflow, workflowIndex) => {
      workflow.steps.forEach((step, stepIndex) => {
        if (step.outputs && typeof step.outputs === 'object') {
          const seenOutputNames = new Set<string>();

          Object.entries(step.outputs).forEach(([outputName, outputValue], outputIndex) => {
            // Validate output name
            if (!OUTPUT_NAME_PATTERN.test(outputName)) {
              results.push({
                message: `"${outputName}" does not match the required pattern "^[a-zA-Z0-9.\\-_]+$".`,
                path: ['workflows', workflowIndex, 'steps', stepIndex, 'outputs', outputName, outputIndex] as JsonPath,
              });
            }

            // Check for uniqueness within the step
            if (seenOutputNames.has(outputName)) {
              results.push({
                message: `"${outputName}" must be unique within the step outputs.`,
                path: ['workflows', workflowIndex, 'steps', stepIndex, 'outputs', outputName, outputIndex] as JsonPath,
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
                path: ['workflows', workflowIndex, 'steps', stepIndex, 'outputs', outputName, outputIndex] as JsonPath,
              });
            }
          });
        }
      });
    });

    return results;
  },
);
