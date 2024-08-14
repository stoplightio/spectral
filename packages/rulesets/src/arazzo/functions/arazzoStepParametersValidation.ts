import { createRulesetFunction } from '@stoplight/spectral-core';
import type { IFunctionResult } from '@stoplight/spectral-core';
import getAllParameters from './utils/getAllParameters';

type Parameter = {
  name: string;
  in?: string;
};

type ReusableObject = {
  reference: string;
};

type Step = {
  parameters?: (Parameter | ReusableObject)[];
  workflowId?: string;
  operationId?: string;
  operationPath?: string;
};

export default createRulesetFunction<
  { steps: Step[]; parameters?: Parameter[]; components?: { parameters?: Record<string, Parameter> } },
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
              parameters: {
                type: 'array',
                items: {
                  oneOf: [
                    {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                        },
                        in: {
                          type: 'string',
                        },
                      },
                      required: ['name'],
                    },
                    {
                      type: 'object',
                      properties: {
                        reference: {
                          type: 'string',
                        },
                      },
                      required: ['reference'],
                    },
                  ],
                },
              },
              workflowId: {
                type: 'string',
              },
              operationId: {
                type: 'string',
              },
              operationPath: {
                type: 'string',
              },
            },
          },
        },
        parameters: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
              in: {
                type: 'string',
              },
            },
            required: ['name'],
          },
        },
        components: {
          type: 'object',
          properties: {
            parameters: {
              type: 'object',
              additionalProperties: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                  in: {
                    type: 'string',
                  },
                },
                required: ['name'],
              },
            },
          },
        },
      },
      required: ['steps'],
    },
    options: null,
  },
  function arazzoStepParametersValidation(targetVal, _) {
    const results: IFunctionResult[] = [];
    const { steps, parameters = [], components = { parameters: {} } } = targetVal;

    // Convert the workflow parameters to the expected format for getAllParameters
    const workflow = { parameters };

    // Process steps
    for (const [stepIndex, step] of steps.entries()) {
      if (!step.parameters) continue;

      const { workflowId, operationId, operationPath } = step;
      const stepParams = getAllParameters(step, workflow, components.parameters ?? {});

      // Check for duplicate parameters within the step
      const paramSet = new Set();
      for (const param of stepParams) {
        const key = `${param.name}-${param.in ?? ''}`;
        if (paramSet.has(key)) {
          results.push({
            message: `"${param.name}" with "in" value "${
              param.in ?? ''
            }" must be unique within the combined parameters.`,
            path: ['steps', stepIndex, 'parameters', stepParams.indexOf(param)],
          });
        } else {
          paramSet.add(key);
        }
      }

      // Check for masked duplicates
      const maskedDuplicates = stepParams.filter(param => param.name.startsWith('masked-duplicate-'));
      if (maskedDuplicates.length > 0) {
        maskedDuplicates.forEach(param => {
          results.push({
            message: `Duplicate parameter: "${param.name.replace(
              'masked-duplicate-',
              '',
            )}" must be unique within the combined parameters.`,
            path: ['steps', stepIndex, 'parameters', stepParams.indexOf(param)],
          });
        });
      }

      // Validate no mix of `in` presence
      const hasInField = stepParams.some(param => 'in' in param);
      const noInField = stepParams.some(param => !('in' in param));

      if (hasInField && noInField) {
        results.push({
          message: `Parameters must not mix "in" field presence.`,
          path: ['steps', stepIndex, 'parameters'],
        });
      }

      // if workflowId is present, there should be no `in` field
      if (workflowId != null && hasInField) {
        results.push({
          message: `Step with "workflowId" must not have parameters with an "in" field.`,
          path: ['steps', stepIndex, 'parameters'],
        });
      }

      // if operationId or operationPath is present, all parameters should have an `in` field
      if ((operationId != null || operationPath != null) && noInField) {
        results.push({
          message: `Step with "operationId" or "operationPath" must have parameters with an "in" field.`,
          path: ['steps', stepIndex, 'parameters'],
        });
      }
    }
    return results;
  },
);
