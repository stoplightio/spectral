import { IFunctionResult } from '@stoplight/spectral-core';
import arazzoCriterionValidation from './arazzoCriterionValidation';

type CriterionExpressionType = {
  type: 'jsonpath' | 'xpath';
  version: 'draft-goessner-dispatch-jsonpath-00' | 'xpath-30' | 'xpath-20' | 'xpath-10';
};

type Criterion = {
  context?: string;
  condition: string;
  type?: 'simple' | 'regex' | 'jsonpath' | 'xpath' | CriterionExpressionType;
};

type Step = {
  stepId: string;
  successCriteria?: Criterion[];
};

type Workflow = {
  workflowId: string;
  steps: Step[];
};

type ArazzoSpecification = {
  workflows: Workflow[];
  components?: object;
};

export default function arazzoStepSuccessCriteriaValidation(
  targetVal: ArazzoSpecification,
  _options: null,
): IFunctionResult[] {
  const results: IFunctionResult[] = [];

  if (Array.isArray(targetVal.workflows)) {
    targetVal.workflows.forEach((workflow, workflowIndex) => {
      if (Array.isArray(workflow.steps)) {
        workflow.steps.forEach((step, stepIndex) => {
          if (Array.isArray(step.successCriteria)) {
            step.successCriteria.forEach((criterion, criterionIndex) => {
              const criterionResults = arazzoCriterionValidation(
                criterion,
                ['workflows', workflowIndex, 'steps', stepIndex, 'successCriteria', criterionIndex],
                targetVal,
              );
              results.push(...criterionResults);
            });
          }
        });
      }
    });
  }

  return results;
}
