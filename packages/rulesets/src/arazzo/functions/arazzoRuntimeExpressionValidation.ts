import { ArazzoSpecification, Step } from './types/arazzoTypes';

function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function validateReusableParameterExpression(expression: string, arazzoSpec: ArazzoSpecification): boolean {
  const parametersRegex = /^\$components\.parameters\.([A-Za-z0-9_\\-]+)$/;
  const match = parametersRegex.exec(expression);

  if (!match) {
    return false; // The expression didn't match the expected pattern
  }

  const [, paramName] = match;

  if (arazzoSpec.components?.parameters && paramName in arazzoSpec.components.parameters) {
    return true; // The parameter exists in the components.parameters
  }

  return false; // The parameter does not exist
}

function validateStepsExpression(
  stepsExpression: string,
  arazzoSpec: ArazzoSpecification,
  currentWorkflowIndex?: number,
): boolean {
  const stepsRegex = /^\$steps\.([A-Za-z0-9_\\-]+)\.(.*)$/;
  const match = stepsRegex.exec(stepsExpression);

  if (!match) {
    return false; // The expression didn't match the expected pattern
  }

  const [, stepId] = match;

  if (arazzoSpec == null || !Array.isArray(arazzoSpec.workflows) || arazzoSpec.workflows.length === 0) {
    return false;
  }

  let stepsToSearch: Step[] = [];
  if (
    currentWorkflowIndex !== undefined &&
    currentWorkflowIndex >= 0 &&
    arazzoSpec.workflows[currentWorkflowIndex] != null
  ) {
    stepsToSearch = arazzoSpec.workflows[currentWorkflowIndex].steps ?? [];
  } else {
    stepsToSearch = arazzoSpec.workflows.flatMap(workflow => workflow.steps ?? []);
  }

  if (stepsToSearch == null || stepsToSearch.length === 0) {
    return false;
  }

  const step = stepsToSearch.find(step => step.stepId === stepId);
  if (!step) {
    return false;
  }

  return true;
}

function validateWorkflowsExpression(workflowsExpression: string, arazzoSpec: ArazzoSpecification): boolean {
  const workflowsRegex = /^\$workflows\.([A-Za-z0-9_\\-]+)\.(.*)$/;
  const match = workflowsRegex.exec(workflowsExpression);

  if (!match) {
    return false;
  }

  const [, workflowId, remainingPath] = match;

  if (arazzoSpec == null || !Array.isArray(arazzoSpec.workflows) || arazzoSpec.workflows.length === 0) {
    return false;
  }

  const workflowIndex = arazzoSpec.workflows.findIndex(workflow => workflow.workflowId === workflowId);
  if (workflowIndex === -1) {
    return false;
  }

  if (remainingPath.startsWith('steps.')) {
    return validateStepsExpression(`$steps.${remainingPath.slice(6)}`, arazzoSpec, workflowIndex);
  }

  return true;
}

function validateInputsExpression(
  inputsExpression: string,
  arazzoSpec: ArazzoSpecification,
  currentWorkflowIndex?: number,
): boolean {
  const inputsRegex = /^\$inputs\.([A-Za-z0-9_\\-]+)$/;
  const match = inputsRegex.exec(inputsExpression);

  if (!match) {
    return false; // The expression didn't match the expected pattern
  }

  const [, inputName] = match;

  if (
    arazzoSpec == null ||
    !Array.isArray(arazzoSpec.workflows) ||
    arazzoSpec.workflows.length === 0 ||
    currentWorkflowIndex === undefined
  ) {
    return false;
  }

  const currentWorkflow = arazzoSpec.workflows[currentWorkflowIndex];

  if (!currentWorkflow.inputs) {
    return false;
  }

  // If inputs are defined directly
  if ('properties' in currentWorkflow.inputs) {
    const properties = (currentWorkflow.inputs as { properties?: Record<string, unknown> }).properties;
    return properties ? inputName in properties : false;
  }

  // If inputs are referenced via $ref
  if ('$ref' in currentWorkflow.inputs) {
    const refPath = (currentWorkflow.inputs as { $ref: string }).$ref.replace(/^#\//, '').split('/');
    let refObject: unknown = arazzoSpec;

    for (const part of refPath) {
      if (isNonNullObject(refObject) && part in refObject) {
        refObject = refObject[part];
      } else {
        return false; // The reference could not be resolved
      }
    }

    const properties = (refObject as { properties?: Record<string, unknown> })?.properties;
    return properties ? inputName in properties : false;
  }

  return false; // The input does not exist in the workflow inputs or referenced schema
}

function validateReusableSuccessActionExpression(expression: string, arazzoSpec: ArazzoSpecification): boolean {
  const successActionsRegex = /^\$components\.successActions\.([A-Za-z0-9_\\-]+)$/;
  const match = successActionsRegex.exec(expression);

  if (!match) {
    return false;
  }

  const [, actionName] = match;

  if (arazzoSpec.components?.successActions && actionName in arazzoSpec.components.successActions) {
    return true;
  }

  return false;
}

function validateReusableFailureActionExpression(expression: string, arazzoSpec: ArazzoSpecification): boolean {
  const failureActionsRegex = /^\$components\.failureActions\.([A-Za-z0-9_\\-]+)$/;
  const match = failureActionsRegex.exec(expression);

  if (!match) {
    return false;
  }

  const [, actionName] = match;

  if (arazzoSpec.components?.failureActions && actionName in arazzoSpec.components.failureActions) {
    return true;
  }

  return false;
}

function arazzoRuntimeExpressionValidation(
  expression: string,
  arazzoSpec?: ArazzoSpecification,
  currentWorkflowIndex?: number,
): boolean {
  if (!expression && !arazzoSpec) {
    return false;
  }

  const validPrefixes = [
    '$url',
    '$method',
    '$statusCode',
    '$request.',
    '$response.',
    '$message.',
    '$inputs.',
    '$outputs.',
    '$steps.',
    '$workflows.',
    '$sourceDescriptions.',
    '$components.inputs.',
    '$components.parameters.',
    '$components.successActions.',
    '$components.failureActions.',
  ];

  const isValidPrefix = validPrefixes.some(prefix => expression.startsWith(prefix));

  if (!isValidPrefix) {
    return false;
  }

  if (expression.startsWith('$steps.') && arazzoSpec) {
    return validateStepsExpression(expression, arazzoSpec, currentWorkflowIndex);
  }

  if (expression.startsWith('$workflows.') && arazzoSpec) {
    return validateWorkflowsExpression(expression, arazzoSpec);
  }

  if (expression.startsWith('$inputs.') && arazzoSpec) {
    return validateInputsExpression(expression, arazzoSpec, currentWorkflowIndex);
  }

  if (expression.startsWith('$components.failureActions.') && arazzoSpec) {
    return validateReusableFailureActionExpression(expression, arazzoSpec);
  }

  if (expression.startsWith('$components.successActions.') && arazzoSpec) {
    return validateReusableSuccessActionExpression(expression, arazzoSpec);
  }

  // Validation for $components.parameters expressions
  if (expression.startsWith('$components.parameters.') && arazzoSpec) {
    return validateReusableParameterExpression(expression, arazzoSpec);
  }

  // ToDo - add more validations for other prefixes and combos

  return true;
}

export default arazzoRuntimeExpressionValidation;
