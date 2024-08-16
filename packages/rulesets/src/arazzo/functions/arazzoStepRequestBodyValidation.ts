import { IFunctionResult } from '@stoplight/spectral-core';
import { createRulesetFunction } from '@stoplight/spectral-core';
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

const MIME_TYPE_REGEX =
  /^(application|audio|font|example|image|message|model|multipart|text|video)\/[a-zA-Z0-9!#$&^_.+-]{1,127}$/;

export default createRulesetFunction<{ steps: Array<{ requestBody?: RequestBody }> }, null>(
  {
    input: {
      type: 'object',
      properties: {
        steps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              requestBody: {
                type: 'object',
                properties: {
                  contentType: { type: 'string' },
                  payload: { type: ['object', 'string', 'number', 'boolean', 'array', 'null'] },
                  replacements: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        target: { type: 'string' },
                        value: { type: ['object', 'string', 'number', 'boolean', 'array', 'null'] },
                      },
                      required: ['target', 'value'],
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
  function validateRequestBody(targetVal) {
    const results: IFunctionResult[] = [];

    //const ctx: RulesetFunctionContext = context as unknown as RulesetFunctionContext;

    if (!Array.isArray(targetVal.steps)) {
      return results; // No steps to validate
    }

    targetVal.steps.forEach((step, stepIndex) => {
      const requestBody = step.requestBody;

      if (!requestBody) {
        return; // Skip steps without requestBody
      }

      // Validate contentType
      if (requestBody.contentType != null && !MIME_TYPE_REGEX.test(requestBody.contentType)) {
        results.push({
          message: `Invalid MIME type in contentType: ${requestBody.contentType}`,
          path: ['steps', stepIndex, 'requestBody', 'contentType'],
        });
      }

      // Validate payload
      if (Boolean(requestBody.payload) && typeof requestBody.payload === 'string') {
        if (!arazzoRuntimeExpressionValidation(requestBody.payload)) {
          results.push({
            message: `Invalid runtime expression in payload: ${requestBody.payload}`,
            path: ['steps', stepIndex, 'requestBody', 'payload'],
          });
        }
      }

      // Validate replacements
      if (Array.isArray(requestBody.replacements)) {
        requestBody.replacements.forEach((replacement, replacementIndex) => {
          if (!replacement.target) {
            results.push({
              message: `"target" is required in Payload Replacement.`,
              path: ['steps', stepIndex, 'requestBody', 'replacements', replacementIndex, 'target'],
            });
          }

          if (
            Boolean(replacement.value) &&
            typeof replacement.value === 'string' &&
            replacement.value.startsWith('$')
          ) {
            if (!arazzoRuntimeExpressionValidation(replacement.value)) {
              results.push({
                message: `Invalid runtime expression in replacement value: ${replacement.value}`,
                path: ['steps', stepIndex, 'requestBody', 'replacements', replacementIndex, 'value'],
              });
            }
          }
        });
      }
    });

    return results;
  },
);
