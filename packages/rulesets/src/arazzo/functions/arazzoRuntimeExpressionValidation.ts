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

type Workflow = {
  workflowId: string;
  steps: Step[];
  successActions?: (SuccessAction | ReusableObject)[];
  failureActions?: (FailureAction | ReusableObject)[];
  outputs?: Record<string, string>;
};

type Step = {
  stepId: string;
  outputs?: Record<string, string>;
  onSuccess?: (SuccessAction | ReusableObject)[];
  onFailure?: (FailureAction | ReusableObject)[];
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

type Criterion = {
  context?: string;
  condition: string;
  type?: 'simple' | 'regex' | 'jsonpath' | 'xpath' | CriterionExpressionType;
};

type CriterionExpressionType = {
  type: 'jsonpath' | 'xpath';
  version: string;
};

type ReusableObject = {
  reference: string;
};

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

  // Ensure that arazzoSpec and its workflows are defined and not null
  if (arazzoSpec == null || !Array.isArray(arazzoSpec.workflows) || arazzoSpec.workflows.length === 0) {
    return false; // The ArazzoSpecification or workflows are not properly defined
  }

  // Get the relevant steps to search in the current workflow or all workflows
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
    return false; // No steps available to search
  }

  const step = stepsToSearch.find(step => step.stepId === stepId);
  if (!step) {
    return false; // The step does not exist
  }

  return true; // The path resolves correctly
}

function validateWorkflowsExpression(workflowsExpression: string, arazzoSpec: ArazzoSpecification): boolean {
  const workflowsRegex = /^\$workflows\.([A-Za-z0-9_\\-]+)\.(.*)$/;
  const match = workflowsRegex.exec(workflowsExpression);

  if (!match) {
    return false; // The expression didn't match the expected pattern
  }

  const [, workflowId, remainingPath] = match;

  // Ensure that arazzoSpec and its workflows are defined and not null
  if (arazzoSpec == null || !Array.isArray(arazzoSpec.workflows) || arazzoSpec.workflows.length === 0) {
    return false;
  }

  // Find the specified workflow
  const workflowIndex = arazzoSpec.workflows.findIndex(workflow => workflow.workflowId === workflowId);
  if (workflowIndex === -1) {
    return false;
  }

  // If the remaining path refers to steps, validate the steps expression
  if (remainingPath.startsWith('steps.')) {
    return validateStepsExpression(`$steps.${remainingPath.slice(6)}`, arazzoSpec, workflowIndex);
  }

  // If the remaining path is empty or does not refer to steps, consider it valid
  return true;
}

function validateReusableSuccessActionExpression(expression: string, arazzoSpec: ArazzoSpecification): boolean {
  const successActionsRegex = /^\$components\.successActions\.([A-Za-z0-9_\\-]+)$/;
  const match = successActionsRegex.exec(expression);

  if (!match) {
    return false; // The expression didn't match the expected pattern
  }

  const [, actionName] = match;

  if (arazzoSpec.components?.successActions && actionName in arazzoSpec.components.successActions) {
    return true; // The action exists in the components.successActions
  }

  return false; // The action does not exist
}

function validateReusableFailureActionExpression(expression: string, arazzoSpec: ArazzoSpecification): boolean {
  const failureActionsRegex = /^\$components\.failureActions\.([A-Za-z0-9_\\-]+)$/;
  const match = failureActionsRegex.exec(expression);

  if (!match) {
    return false; // The expression didn't match the expected pattern
  }

  const [, actionName] = match;

  if (arazzoSpec.components?.failureActions && actionName in arazzoSpec.components.failureActions) {
    return true; // The action exists in the components.failureActions
  }

  return false; // The action does not exist
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

  // Early return if no valid prefix found
  if (!isValidPrefix) {
    return false;
  }

  // Basic validation of $steps expressions
  if (expression.startsWith('$steps.') && arazzoSpec) {
    return validateStepsExpression(expression, arazzoSpec, currentWorkflowIndex);
  }

  // Basic validation for $workflows expressions
  if (expression.startsWith('$workflows.') && arazzoSpec) {
    return validateWorkflowsExpression(expression, arazzoSpec);
  }

  // Basic validation for $components.failureActions expressions
  if (expression.startsWith('$components.failureActions.') && arazzoSpec) {
    return validateReusableFailureActionExpression(expression, arazzoSpec);
  }

  // Basic validation for $components.successActions expressions
  if (expression.startsWith('$components.successActions.') && arazzoSpec) {
    return validateReusableSuccessActionExpression(expression, arazzoSpec);
  }

  // ToDo: Add any other advanced validation here

  return true;
}

export default arazzoRuntimeExpressionValidation;
