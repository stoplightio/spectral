import arazzoWorkflowDependsOnValidation from '../arazzoWorkflowDependsOnValidation';
import { IFunctionResult } from '@stoplight/spectral-core';

type SourceDescription = {
  name: string;
  url: string;
  type?: string;
};

type Workflow = {
  workflowId: string;
  steps: Step[];
  dependsOn?: string[];
};

type Step = {
  stepId: string;
  outputs?: { [key: string]: string };
};

type Parameter = {
  name: string;
  in?: string;
  value?: unknown;
};

type ArazzoSpecification = {
  sourceDescriptions?: SourceDescription[];
  workflows: Workflow[];
  components?: {
    parameters?: Record<string, Parameter>;
    successActions?: Record<string, SuccessAction>;
    failureActions?: Record<string, FailureAction>;
    [key: string]: unknown;
  };
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
const runRule = (target: ArazzoSpecification): IFunctionResult[] => {
  return arazzoWorkflowDependsOnValidation(target, null);
};

describe('arazzoWorkflowDependsOnValidation', () => {
  test('should not report any errors for valid dependsOn references', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [],
        },
        {
          workflowId: 'workflow2',
          dependsOn: ['workflow1'],
          steps: [],
        },
      ],
      sourceDescriptions: [{ name: 'source1', url: 'http://example.com', type: 'arazzo' }],
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for duplicate workflowId in dependsOn', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [],
        },
        {
          workflowId: 'workflow2',
          dependsOn: ['workflow1', 'workflow1'],
          steps: [],
        },
      ],
      sourceDescriptions: [{ name: 'source1', url: 'http://example.com', type: 'arazzo' }],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: 'Duplicate workflowId "workflow1" in dependsOn for workflow "workflow2".',
      path: ['workflows', 1, 'dependsOn', 1],
    });
  });

  test('should report an error for non-existent local workflowId in dependsOn', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [],
        },
        {
          workflowId: 'workflow2',
          dependsOn: ['workflow3'],
          steps: [],
        },
      ],
      sourceDescriptions: [{ name: 'source1', url: 'http://example.com', type: 'arazzo' }],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: 'WorkflowId "workflow3" not found in local Arazzo workflows "workflow2".',
      path: ['workflows', 1, 'dependsOn', 0],
    });
  });

  test('should report an error for non-existent source description in dependsOn', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [],
        },
        {
          workflowId: 'workflow2',
          dependsOn: ['$sourceDescriptions.nonExistent.workflow3'],
          steps: [],
        },
      ],
      sourceDescriptions: [{ name: 'source1', url: 'http://example.com', type: 'arazzo' }],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: 'Source description "nonExistent" not found for workflowId "$sourceDescriptions.nonExistent.workflow3".',
      path: ['workflows', 1, 'dependsOn', 0],
    });
  });

  test('should report an error for missing workflowId part in runtime expression', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [],
        },
        {
          workflowId: 'workflow2',
          dependsOn: ['$sourceDescriptions.source1'],
          steps: [],
        },
      ],
      sourceDescriptions: [{ name: 'source1', url: 'http://example.com', type: 'arazzo' }],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: 'WorkflowId part is missing in the expression "$sourceDescriptions.source1".',
      path: ['workflows', 1, 'dependsOn', 0],
    });
  });

  test('should report an error for non-arazzo type in source description', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [],
        },
        {
          workflowId: 'workflow2',
          dependsOn: ['$sourceDescriptions.source1.workflow3'],
          steps: [],
        },
      ],
      sourceDescriptions: [{ name: 'source1', url: 'http://example.com', type: 'openapi' }],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message: 'Source description "source1" must have a type of "arazzo".',
      path: ['workflows', 1, 'dependsOn', 0],
    });
  });

  test('should report an error for invalid runtime expression in dependsOn', () => {
    const results = runRule({
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [],
        },
        {
          workflowId: 'workflow2',
          dependsOn: ['$invalid.source1.expression'],
          steps: [],
        },
      ],
      sourceDescriptions: [{ name: 'source1', url: 'http://example.com', type: 'arazzo' }],
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      message: 'Runtime expression "$invalid.source1.expression" is invalid.',
      path: ['workflows', 1, 'dependsOn', 0],
    });
  });
});