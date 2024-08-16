import arazzoStepValidation from '../arazzoStepValidation';
import type { IFunctionResult } from '@stoplight/spectral-core';

type SourceDescription = {
  name: string;
  url: string;
  type?: string;
};

type Step = {
  stepId: string;
  operationId?: string;
  operationPath?: string;
  workflowId?: string;
};

type Workflow = {
  steps: Step[];
  sourceDescriptions: SourceDescription[];
};

const runRule = (target: Workflow): IFunctionResult[] => {
  return arazzoStepValidation(target, null);
};

describe('arazzoStepValidation', () => {
  test('should not report any errors for valid operationId, operationPath, and workflowId', () => {
    const results = runRule({
      steps: [
        {
          stepId: 'step1',
          operationId: '$sourceDescriptions.validSource.operationId',
        },
        {
          stepId: 'step2',
          operationPath: '{$sourceDescriptions.validSource.url}',
        },
        {
          stepId: 'step3',
          workflowId: '$sourceDescriptions.validSource.workflowId',
        },
      ],
      sourceDescriptions: [{ name: 'validSource', url: 'http://example.com', type: 'arazzo' }],
    });

    expect(results).toHaveLength(0);
  });

  test('should report an error for invalid operationId runtime expression', () => {
    const results = runRule({
      steps: [
        {
          stepId: 'step1',
          operationId: '$invalidSourceDescription.operationId',
        },
      ],
      sourceDescriptions: [{ name: 'validSource', url: 'http://example.com', type: 'arazzo' }],
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      message: 'Runtime expression "$invalidSourceDescription.operationId" is invalid in step "step1".',
      path: ['steps', 0, 'operationId'],
    });
  });

  test('should report an error for invalid operationPath format', () => {
    const results = runRule({
      steps: [
        {
          stepId: 'step1',
          operationPath: 'invalidOperationPathFormat',
        },
      ],
      sourceDescriptions: [{ name: 'validSource', url: 'http://example.com', type: 'arazzo' }],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message:
        'OperationPath "invalidOperationPathFormat" must be a valid runtime expression following the format "{$sourceDescriptions.<name>.url}".',
      path: ['steps', 0, 'operationPath'],
    });
  });

  test('should report an error for invalid workflowId runtime expression', () => {
    const results = runRule({
      steps: [
        {
          stepId: 'step1',
          workflowId: '$invalidSourceDescription.workflowId',
        },
      ],
      sourceDescriptions: [{ name: 'validSource', url: 'http://example.com', type: 'arazzo' }],
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      message: 'Runtime expression "$invalidSourceDescription.workflowId" is invalid in step "step1".',
      path: ['steps', 0, 'workflowId'],
    });
  });

  test('should report an error for missing source description in operationPath', () => {
    const results = runRule({
      steps: [
        {
          stepId: 'step1',
          operationPath: '{$sourceDescriptions.missingSource.url}',
        },
      ],
      sourceDescriptions: [{ name: 'validSource', url: 'http://example.com', type: 'arazzo' }],
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      message:
        'Source description "missingSource" not found for operationPath "{$sourceDescriptions.missingSource.url}" in step "step1".',
      path: ['steps', 0, 'operationPath'],
    });
  });
});
