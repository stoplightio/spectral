import { IFunctionResult } from '@stoplight/spectral-core';
import arazzoCriterionValidation from './arazzoCriterionValidation';
import { ArazzoSpecification } from './types/arazzoTypes';

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
