export type CriterionExpressionType = {
  type: 'jsonpath' | 'xpath';
  version: 'draft-goessner-dispatch-jsonpath-00' | 'xpath-30' | 'xpath-20' | 'xpath-10';
};

export type Criterion = {
  context?: string;
  condition: string;
  type?: 'simple' | 'regex' | 'jsonpath' | 'xpath' | CriterionExpressionType;
};

export type Parameter = {
  name: string;
  in?: string;
  value?: unknown;
};

export type FailureAction = {
  name: string;
  type: string;
  workflowId?: string;
  stepId?: string;
  retryAfter?: number;
  retryLimit?: number;
  criteria?: Criterion[];
};

export type SuccessAction = {
  name: string;
  type: string;
  workflowId?: string;
  stepId?: string;
  criteria?: Criterion[];
};

export type ReusableObject = {
  reference: string;
  value?: unknown;
};

export type PayloadReplacement = {
  target: string;
  value: unknown | string;
};

export type RequestBody = {
  contentType?: string;
  payload?: unknown | string;
  replacements?: PayloadReplacement[];
};

export type Step = {
  stepId: string;
  onFailure?: (FailureAction | ReusableObject)[];
  onSuccess?: (SuccessAction | ReusableObject)[];
  parameters?: (Parameter | ReusableObject)[];
  successCriteria?: Criterion[];
  requestBody?: RequestBody;
  outputs?: { [key: string]: string };
  workflowId?: string;
  operationId?: string;
  operationPath?: string;
};

export type SourceDescription = {
  name: string;
  url: string;
  type?: 'arazzo' | 'openapi';
};

export type Workflow = {
  workflowId: string;
  steps: Step[];
  inputs?: Record<string, unknown>;
  parameters?: (Parameter | ReusableObject)[];
  successActions?: (SuccessAction | ReusableObject)[];
  failureActions?: (FailureAction | ReusableObject)[];
  dependsOn?: string[];
  outputs?: { [key: string]: string };
};

export type ArazzoSpecification = {
  workflows: Workflow[];
  sourceDescriptions?: SourceDescription[];
  components?: {
    inputs?: Record<string, unknown>;
    parameters?: Record<string, Parameter>;
    successActions?: Record<string, SuccessAction>;
    failureActions?: Record<string, FailureAction>;
    [key: string]: unknown;
  };
};
