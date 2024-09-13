import { IFunctionResult } from '@stoplight/spectral-core';
import validateRuntimeExpression from './arazzoRuntimeExpressionValidation';
import { Criterion, ArazzoSpecification } from './types/arazzoTypes';

export default function arazzoCriterionValidation(
  criterion: Criterion,
  contextPath: (string | number)[],
  arazzoSpec: ArazzoSpecification, // Updated from Workflow to ArazzoSpecification
): IFunctionResult[] {
  const results: IFunctionResult[] = [];

  // Validate that condition exists
  if (!criterion.condition || typeof criterion.condition !== 'string' || criterion.condition.trim() === '') {
    results.push({
      message: `Missing or invalid "condition" in Criterion Object.`,
      path: [...contextPath, 'condition'],
    });
  }

  // If type is defined, validate context presence
  if (criterion.type !== undefined && criterion.type !== null && criterion.context == null) {
    results.push({
      message: `A "context" must be specified for a Criterion Object with type "${criterion.type as string}".`,
      path: [...contextPath, 'context'],
    });
  }

  // Validate Criterion Expression Type Object if type is an object
  if (typeof criterion.type === 'object') {
    const { type, version } = criterion.type;
    if (!type || !version) {
      results.push({
        message: `"type" and "version" must be specified in the Criterion Expression Type Object.`,
        path: [...contextPath, 'type'],
      });
    }
  }

  // Validate regex pattern
  if (criterion.type === 'regex') {
    try {
      new RegExp(criterion.condition); // Test if the regex is valid
    } catch {
      results.push({
        message: `"condition" contains an invalid regex pattern.`,
        path: [...contextPath, 'condition'],
      });
    }
  }

  // Validate context using arazzoRuntimeExpressionValidation
  if (criterion.context != null && !validateRuntimeExpression(criterion.context, arazzoSpec)) {
    results.push({
      message: `"context" contains an invalid runtime expression.`,
      path: [...contextPath, 'context'],
    });
  }

  // Add JSONPath, XPath, and other advanced checks as needed

  return results;
}
