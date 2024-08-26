import { IFunctionResult } from '@stoplight/spectral-core';
import arazzoRuntimeExpressionValidation from './arazzoRuntimeExpressionValidation';

type PayloadReplacement = {
  target: string;
  value: unknown | string;
};

type RequestBody = {
  contentType?: string;
  payload?: unknown | string;
  replacements?: PayloadReplacement[];
};

type Parameter = {
  name: string;
  in?: string;
  value?: unknown;
};

type Step = {
  stepId: string;
  outputs?: Record<string, string>;
  requestBody?: RequestBody;
  parameters?: (Parameter | ReusableObject)[];
};

type ArazzoSpecification = {
  workflows: Workflow[];
  sourceDescriptions?: SourceDescription[];
  components?: {
    parameters?: Record<string, Parameter>;
    [key: string]: unknown;
  };
};

type ReusableObject = {
  reference: string;
};

type SourceDescription = {
  name: string;
  url: string;
  type?: string;
};

type Workflow = {
  workflowId: string;
  steps: Step[];
  inputs?: Record<string, unknown>;
  parameters?: (Parameter | ReusableObject)[];
  outputs?: Record<string, string>;
};

const MIME_TYPE_REGEX =
  /^(application|audio|font|example|image|message|model|multipart|text|video)\/[a-zA-Z0-9!#$&^_.+-]{1,127}$/;

export function arazzoStepRequestBodyValidation(target: ArazzoSpecification, _options: null): IFunctionResult[] {
  const results: IFunctionResult[] = [];

  // Validate each workflow
  if (Array.isArray(target.workflows)) {
    target.workflows.forEach((workflow, workflowIndex) => {
      // Validate each step in the workflow
      workflow.steps.forEach((step, stepIndex) => {
        const requestBody = step.requestBody;

        if (!requestBody) {
          return; // Skip steps without requestBody
        }

        // Validate contentType
        if (requestBody.contentType != null && !MIME_TYPE_REGEX.test(requestBody.contentType)) {
          results.push({
            message: `Invalid MIME type in contentType: ${requestBody.contentType}`,
            path: ['workflows', workflowIndex, 'steps', stepIndex, 'requestBody', 'contentType'],
          });
        }

        // Validate payload
        if (
          Boolean(requestBody.payload) &&
          typeof requestBody.payload === 'string' &&
          requestBody.payload.startsWith('$')
        ) {
          if (!arazzoRuntimeExpressionValidation(requestBody.payload, target, workflowIndex)) {
            results.push({
              message: `Invalid runtime expression in payload: ${requestBody.payload}`,
              path: ['workflows', workflowIndex, 'steps', stepIndex, 'requestBody', 'payload'],
            });
          }
        }

        // Validate replacements
        if (Array.isArray(requestBody.replacements)) {
          requestBody.replacements.forEach((replacement, replacementIndex) => {
            if (!replacement.target) {
              results.push({
                message: `"target" is required in Payload Replacement.`,
                path: [
                  'workflows',
                  workflowIndex,
                  'steps',
                  stepIndex,
                  'requestBody',
                  'replacements',
                  replacementIndex,
                  'target',
                ],
              });
            }

            if (
              Boolean(replacement.value) &&
              typeof replacement.value === 'string' &&
              replacement.value.startsWith('$')
            ) {
              if (!arazzoRuntimeExpressionValidation(replacement.value, target, workflowIndex)) {
                results.push({
                  message: `Invalid runtime expression in replacement value: ${replacement.value}`,
                  path: [
                    'workflows',
                    workflowIndex,
                    'steps',
                    stepIndex,
                    'requestBody',
                    'replacements',
                    replacementIndex,
                    'value',
                  ],
                });
              }
            }
          });
        }
      });
    });
  }

  return results;
}

export default arazzoStepRequestBodyValidation;
