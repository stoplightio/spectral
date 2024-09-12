import type { RulesetFunctionContext } from '@stoplight/spectral-core';
import arazzoDocumentSchema from '../arazzoDocumentSchema';
import { arazzo1_0 } from '@stoplight/spectral-formats';

function runSchema(target: unknown, context?: Partial<RulesetFunctionContext>) {
  return arazzoDocumentSchema(target, null, {
    path: [],
    documentInventory: {},
    document: {
      formats: new Set([arazzo1_0]),
      source: '',
      diagnostics: [],
      getRangeForJsonPath: jest.fn(), // Mocked function
      trapAccess: jest.fn(), // Mocked function
      data: target,
    },
    ...context,
  } as RulesetFunctionContext);
}

describe('arazzoDocumentSchema', () => {
  test('should pass for a valid Arazzo document', () => {
    const validDocument = {
      arazzo: '1.0.0',
      info: {
        title: 'Valid Arazzo',
        version: '1.0.0',
      },
      sourceDescriptions: [{ name: 'source1', url: 'https://example.com', type: 'arazzo' }],
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              operationId: 'operation1',
            },
          ],
        },
      ],
    };

    const results = runSchema(validDocument);
    expect(results).not.toBeUndefined();
    expect(results).toHaveLength(0);
  });

  test('should fail when required fields are missing', () => {
    const invalidDocument = {
      arazzo: '1.0.0',
      // Missing info, sourceDescriptions, and workflows
    };

    const results = runSchema(invalidDocument);
    expect(results).toHaveLength(3); // Expect 3 errors for the missing fields
    expect(results[0].message).toContain('must have required property "info"');
    expect(results[1].message).toContain('must have required property "sourceDescriptions"');
    expect(results[2].message).toContain('must have required property "workflows"');
  });

  test('should fail when arazzo version is invalid', () => {
    const invalidVersionDocument = {
      arazzo: '2.0.0', // Invalid version pattern
      info: {
        title: 'Invalid Arazzo',
        version: '1.0.0',
      },
      sourceDescriptions: [{ name: 'source1', url: 'https://example.com', type: 'arazzo' }],
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              operationId: 'operation1',
            },
          ],
        },
      ],
    };

    const results = runSchema(invalidVersionDocument);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('"arazzo" property must match pattern "^1\\.0\\.\\d+(-.+)?$"');
  });

  test('should fail when source description name is invalid', () => {
    const invalidSourceNameDocument = {
      arazzo: '1.0.0',
      info: {
        title: 'Arazzo with Invalid Source Name',
        version: '1.0.0',
      },
      sourceDescriptions: [
        { name: 'Invalid Name!', url: 'https://example.com', type: 'arazzo' }, // Invalid name pattern
      ],
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              operationId: 'operation1',
            },
          ],
        },
      ],
    };

    const results = runSchema(invalidSourceNameDocument);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('"name" property must match pattern "^[A-Za-z0-9_\\-]+$"');
  });

  test('should fail when stepId is missing from a workflow step', () => {
    const invalidStepDocument = {
      arazzo: '1.0.0',
      info: {
        title: 'Arazzo with Missing StepId',
        version: '1.0.0',
      },
      sourceDescriptions: [{ name: 'source1', url: 'https://example.com', type: 'arazzo' }],
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              operationId: 'operation1', // Missing stepId
            },
          ],
        },
      ],
    };

    const results = runSchema(invalidStepDocument);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('must have required property "stepId"');
  });

  test('should pass when success and failure actions are valid', () => {
    const validActionsDocument = {
      arazzo: '1.0.0',
      info: {
        title: 'Arazzo with Valid Actions',
        version: '1.0.0',
      },
      sourceDescriptions: [{ name: 'source1', url: 'https://example.com', type: 'arazzo' }],
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              operationId: 'operation1',
              onSuccess: [{ name: 'successAction', type: 'goto', stepId: 'step2' }],
              onFailure: [{ name: 'failureAction', type: 'retry', retryAfter: 5, retryLimit: 3 }],
            },
            {
              stepId: 'step2',
              operationId: 'operation2',
            },
          ],
        },
      ],
    };

    const results = runSchema(validActionsDocument);
    expect(results).not.toBeUndefined();
    expect(results).toHaveLength(0);
  });

  test('should fail when sourceDescriptions are missing required fields', () => {
    const invalidSourceDescriptionDocument = {
      arazzo: '1.0.0',
      info: {
        title: 'Arazzo with Missing Source Description Fields',
        version: '1.0.0',
      },
      sourceDescriptions: [
        { name: 'source1' }, // Missing url and type
      ],
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              operationId: 'operation1',
            },
          ],
        },
      ],
    };

    const results = runSchema(invalidSourceDescriptionDocument);
    expect(results).toHaveLength(1); // Missing url
    expect(results[0].message).toContain('must have required property "url"');
  });

  test('should pass when stepId or workflowId is not specified and type is end', () => {
    const validActionsDocument = {
      arazzo: '1.0.0',
      info: {
        title: 'Arazzo with Valid End Type Action',
        version: '1.0.0',
      },
      sourceDescriptions: [{ name: 'source1', url: 'https://example.com', type: 'arazzo' }],
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              operationId: 'operation1',
              onSuccess: [{ name: 'successAction', type: 'end' }],
              onFailure: [{ name: 'failureAction', type: 'end' }],
            },
          ],
        },
      ],
    };

    const results = runSchema(validActionsDocument);
    expect(results).toHaveLength(0);
  });

  test('should fail when stepId is specified and type is end', () => {
    const invalidActionsDocument = {
      arazzo: '1.0.0',
      info: {
        title: 'Arazzo with Invalid StepId and End Type',
        version: '1.0.0',
      },
      sourceDescriptions: [{ name: 'source1', url: 'https://example.com', type: 'arazzo' }],
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              operationId: 'operation1',
              onSuccess: [{ name: 'successAction', type: 'end', stepId: 'step2' }],
              onFailure: [{ name: 'failureAction', type: 'end', stepId: 'step2' }],
            },
          ],
        },
      ],
    };

    const results = runSchema(invalidActionsDocument);
    expect(results[0].message).toContain(
      'property must be equal to one of the allowed values: "goto". Did you mean "goto"?',
    );
  });

  test('should fail when workflowId is specified and type is end', () => {
    const invalidActionsDocument = {
      arazzo: '1.0.0',
      info: {
        title: 'Arazzo with Invalid WorkflowId and End Type',
        version: '1.0.0',
      },
      sourceDescriptions: [{ name: 'source1', url: 'https://example.com', type: 'arazzo' }],
      workflows: [
        {
          workflowId: 'workflow1',
          steps: [
            {
              stepId: 'step1',
              operationId: 'operation1',
              onSuccess: [{ name: 'successAction', type: 'end', workflowId: 'workflow2' }],
              onFailure: [{ name: 'failureAction', type: 'end', workflowId: 'workflow2' }],
            },
          ],
        },
      ],
    };

    const results = runSchema(invalidActionsDocument);
    expect(results[0].message).toContain(
      'property must be equal to one of the allowed values: "goto". Did you mean "goto"?',
    );
  });
});
