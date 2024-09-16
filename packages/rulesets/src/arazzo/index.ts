import { arazzo1_0 } from '@stoplight/spectral-formats';
import { truthy, falsy, pattern } from '@stoplight/spectral-functions';

import arazzoDocumentSchema from './functions/arazzoDocumentSchema';
import arazzoWorkflowIdUniqueness from './functions/arazzoWorkflowIdUniqueness';
import arazzoStepIdUniqueness from './functions/arazzoStepIdUniqueness';
import arazzoWorkflowOutputNamesValidation from './functions/arazzoWorkflowOutputNamesValidation';
import arazzoStepOutputNamesValidation from './functions/arazzoStepOutputNamesValidation';
import arazzoStepParametersValidation from './functions/arazzoStepParametersValidation';
import arazzoStepFailureActionsValidation from './functions/arazzoStepFailureActionsValidation';
import arazzoStepSuccessActionsValidation from './functions/arazzoStepSuccessActionsValidation';
import arazzoWorkflowDependsOnValidation from './functions/arazzoWorkflowDependsOnValidation';
import arazzoStepSuccessCriteriaValidation from './functions/arazzoStepSuccessCriteriaValidation';
import arazzoStepRequestBodyValidation from './functions/arazzoStepRequestBodyValidation';
import arazzoStepValidation from './functions/arazzoStepValidation';

export default {
  documentationUrl: 'https://meta.stoplight.io/docs/spectral/docs/reference/arazzo-rules.md',
  formats: [arazzo1_0],
  rules: {
    'arazzo-document-schema': {
      description: 'Arazzo Document must be valid against the Arazzo schema.',
      message: '{{error}}',
      severity: 0,
      given: '$',
      then: {
        function: arazzoDocumentSchema,
      },
    },
    'arazzo-workflowId-unique': {
      description: 'Every workflow must have unique "workflowId".',
      message: `{{error}}`,
      severity: 0,
      given: '$',
      then: {
        function: arazzoWorkflowIdUniqueness,
      },
    },
    'arazzo-workflow-output-validation': {
      description: 'Every workflow output must have unique name and its value must be a valid runtime expression.',
      message: `{{error}}`,
      severity: 0,
      given: '$',
      then: {
        function: arazzoWorkflowOutputNamesValidation,
      },
    },
    'arazzo-workflow-stepId-unique': {
      description: 'Every step must have unique "stepId".',
      message: `{{error}}`,
      severity: 0,
      given: '$.workflows[*]',
      then: {
        function: arazzoStepIdUniqueness,
      },
    },
    'arazzo-step-output-validation': {
      description: 'Every step output must have unique name and its value must be a valid runtime expression.',
      message: `{{error}}`,
      severity: 0,
      given: '$',
      then: {
        function: arazzoStepOutputNamesValidation,
      },
    },
    'arazzo-step-parameters-validation': {
      description: 'Step parameters and workflow parameters must valid.',
      message: `{{error}}`,
      severity: 0,
      given: '$',
      then: {
        function: arazzoStepParametersValidation,
      },
    },
    'arazzo-step-failure-actions-validation': {
      description:
        'Every failure action must have a unique "name", and the fields "workflowId" and "stepId" are mutually exclusive.',
      message: `{{error}}`,
      severity: 0,
      given: '$',
      then: {
        function: arazzoStepFailureActionsValidation,
      },
    },
    'arazzo-step-success-actions-validation': {
      description:
        'Every success action must have a unique "name", and the fields "workflowId" and "stepId" are mutually exclusive.',
      message: `{{error}}`,
      severity: 0,
      given: '$',
      then: {
        function: arazzoStepSuccessActionsValidation,
      },
    },
    'arazzo-workflow-depends-on-validation': {
      description: 'Every workflow dependency must be valid.',
      severity: 0,
      given: '$',
      then: {
        function: arazzoWorkflowDependsOnValidation,
      },
    },
    'arazzo-step-success-criteria-validation': {
      description: 'Every success criteria must have a valid context, conditions, and types.',
      message: `{{error}}`,
      severity: 0,
      given: '$.workflows[*]',
      then: {
        function: arazzoStepSuccessCriteriaValidation,
      },
    },
    'arazzo-step-request-body-validation': {
      description: 'Every step request body must have a valid `contentType` and use of runtime expressions.',
      severity: 0,
      given: '$',
      then: {
        function: arazzoStepRequestBodyValidation,
      },
    },
    'arazzo-step-validation': {
      description:
        'Every step must have a valid "stepId" and an valid "operationId" or "operationPath" or "workflowId".',
      severity: 0,
      given: '$',
      then: {
        function: arazzoStepValidation,
      },
    },
    'arazzo-no-script-tags-in-markdown': {
      description: 'Markdown descriptions must not have "<script>" tags.',
      given: '$..[description,title]',
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '<script',
        },
      },
    },
    'arazzo-info-description': {
      description: 'Info "description" should be present and non-empty string.',
      severity: 'warn',
      given: '$',
      then: {
        field: 'info.description',
        function: truthy,
      },
    },
    'arazzo-info-summary': {
      description: 'Info "summary" is recommended be present and be a non-empty string.',
      severity: 'hint',
      given: '$',
      then: {
        field: 'info.summary',
        function: truthy,
      },
    },
    'arazzo-source-descriptions-type': {
      description: 'Source Description "type" should be present.',
      severity: 'warn',
      given: '$.sourceDescriptions[*]',
      then: {
        field: 'type',
        function: truthy,
      },
    },
    'arazzo-workflow-workflowId': {
      description: 'Workflow "workflowId" should follow the pattern "^[A-Za-z0-9_\\-]+$".',
      severity: 'warn',
      given: '$.workflows[*]',
      then: {
        field: 'workflowId',
        function: pattern,
        functionOptions: {
          match: '^[A-Za-z0-9_\\-]+$',
        },
      },
    },
    'arazzo-workflow-description': {
      description: 'Workflow "description" should be present and non-empty string.',
      severity: 'warn',
      given: '$.workflows[*]',
      then: {
        field: 'description',
        function: truthy,
      },
    },
    'arazzo-workflow-summary': {
      description: 'Workflow "summary" should be present and non-empty string.',
      severity: 'hint',
      given: '$.workflows[*]',
      then: {
        field: 'summary',
        function: truthy,
      },
    },
    'arazzo-step-description': {
      description: 'Step "description" should be present and non-empty string.',
      severity: 'warn',
      given: '$.workflows[*].steps[*]',
      then: {
        field: 'description',
        function: truthy,
      },
    },
    'arazzo-step-stepId': {
      description: 'Step "stepId" should follow the pattern "^[A-Za-z0-9_\\-]+$".',
      severity: 'warn',
      given: '$.workflows[*].steps[*]',
      then: {
        field: 'stepId',
        function: pattern,
        functionOptions: {
          match: '^[A-Za-z0-9_\\-]+$',
        },
      },
    },
    'arazzo-step-operationPath': {
      description: 'It is recommended to use "operationId" rather than "operationPath".',
      severity: 'hint',
      given: '$.workflows[*].steps[*]',
      then: {
        field: 'operationPath',
        function: falsy,
      },
    },
  },
};
