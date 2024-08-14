import { isPlainObject } from '@stoplight/json';

type Parameter = {
  name: string;
  in?: string;
};

type ReusableObject = {
  reference: string;
};

type Step = {
  parameters?: (Parameter | ReusableObject)[];
};

type Workflow = {
  parameters?: Parameter[];
};

const resolveReusableParameters = (
  reusableObject: ReusableObject,
  components: Record<string, Parameter>,
): Parameter | undefined => {
  const refPath = reusableObject.reference.replace('$components.parameters.', '');
  return components[refPath];
};

export default function getAllParameters(
  step: Step,
  workflow: Workflow,
  components: Record<string, Parameter>,
): Parameter[] {
  const resolvedParameters: Parameter[] = [];

  if (step.parameters) {
    step.parameters.forEach(param => {
      if (isPlainObject(param) && 'reference' in param) {
        const resolvedParam = resolveReusableParameters(param, components);
        if (resolvedParam) {
          resolvedParameters.push(resolvedParam);
        }
      } else {
        resolvedParameters.push(param);
      }
    });
  }

  if (workflow.parameters) {
    workflow.parameters.forEach(param => {
      if (resolvedParameters.some(p => p.name === param.name && p.in === param.in)) {
        // Tag duplicate parameter
        param.name = `masked-duplicate-${param.name}`;
      }
      resolvedParameters.push(param);
    });
  }

  return resolvedParameters;
}
