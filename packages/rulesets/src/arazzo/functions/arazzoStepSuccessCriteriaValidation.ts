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
  steps: Step[];
};

export default function validateSuccessCriteria(targetVal: Workflow, _options: null): IFunctionResult[] {
  const results: IFunctionResult[] = [];

  targetVal.steps.forEach((step, stepIndex) => {
    if (step.successCriteria) {
      step.successCriteria.forEach((criterion, criterionIndex) => {
        const criterionResults = arazzoCriterionValidation(
          criterion,
          ['steps', stepIndex, 'successCriteria', criterionIndex],
          targetVal,
        );
        results.push(...criterionResults);
      });
    }
  });

  return results;
}
