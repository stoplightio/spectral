import { arazzo1_0 } from '@stoplight/spectral-formats';

import arazzoWorkflowIdUniqueness from './functions/arazzoWorkflowIdUniqueness';
import arazzoStepIdUniqueness from './functions/arazzoStepIdUniqueness';
import arazzoWorkflowOutputNamesValidation from './functions/arazzoWorkflowOutputNamesValidation';
import arazzoStepOutputNamesValidation from './functions/arazzoStepOutputNamesValidation';
import arazzoStepParametersValidation from './functions/arazzoStepParametersValidation';
import arazzoStepFailureActionsValidation from './functions/arazzoStepFailureActionsValidation';
import arazzoStepSuccessActionsValidation from './functions/arazzoStepSuccessActionsValidation';

export default {
  documentationUrl: 'https://meta.stoplight.io/docs/spectral/docs/reference/arazzo-rules.md',
  formats: [arazzo1_0],
  rules: {
    'arazzo-workflowId-unique': {
      description: 'Every workflow must have unique "workflowId".',
      recommended: true,
      severity: 0,
      given: '$.workflows',
      then: {
        function: arazzoWorkflowIdUniqueness,
      },
    },
    'arazzo-workflow-output-names-validation': {
      description: 'Every workflow output must have unique name.',
      recommended: true,
      severity: 0,
      given: '$.workflows[*].outputs',
      then: {
        function: arazzoWorkflowOutputNamesValidation,
      },
    },
    'arazzo-workflow-stepId-unique': {
      description: 'Every step must have unique "stepId".',
      recommended: true,
      severity: 0,
      given: '$.steps',
      then: {
        function: arazzoStepIdUniqueness,
      },
    },
    'arazzo-step-output-names-validation': {
      description: 'Every step output must have unique name.',
      recommended: true,
      severity: 0,
      given: '$.steps[*].outputs',
      then: {
        function: arazzoStepOutputNamesValidation,
      },
    },
    'arazzo-step-parameters-validation': {
      description: 'Step parameters and workflow parameters must be independently unique.',
      recommended: true,
      severity: 0,
      given: '$.workflow[*]',
      then: {
        function: arazzoStepParametersValidation,
      },
    },
    'arazzo-step-failure-actions-validation': {
      description: 'Every failure action must have a unique name and "workflowId" and "stepId" are mutually exclusive.',
      recommended: true,
      severity: 0,
      given: '$.workflows[*]',
      then: {
        function: arazzoStepFailureActionsValidation,
      },
    },
    'arazzo-step-success-actions-validation': {
      description: 'Every success action must have a unique name and "workflowId" and "stepId" are mutually exclusive.',
      recommended: true,
      severity: 0,
      given: '$.workflows[*]',
      then: {
        function: arazzoStepSuccessActionsValidation,
      },
    },
  },
};
