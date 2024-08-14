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
  parameters?: (Parameter | ReusableObject)[];
  components?: { parameters?: Record<string, Parameter> };
};

const resolveReusableParameters = (
  reusableObject: ReusableObject,
  components: Record<string, Parameter>,
): Parameter | undefined => {
  const refPath = reusableObject.reference.replace('$components.parameters.', '');
  return components[refPath];
};

function isParameter(param: unknown): param is Parameter {
  if (typeof param === 'object' && param !== null) {
    const obj = param as Record<string, unknown>;
    return typeof obj.name === 'string' && (typeof obj.in === 'string' || obj.in === undefined);
  }
  return false;
}

export default function getAllParameters(
  step: Step,
  workflow: Workflow,
  components: Record<string, Parameter>,
): Parameter[] {
  const resolvedParameters: Parameter[] = [];
  const resolvedStepParameters: Parameter[] = [];

  if (workflow.parameters) {
    workflow.parameters.forEach(param => {
      let paramToPush = param;

      if (isPlainObject(param) && 'reference' in param) {
        const resolvedParam = resolveReusableParameters(param, components);
        if (resolvedParam) {
          paramToPush = resolvedParam;
        }
      }

      if (isParameter(paramToPush)) {
        const isDuplicate = resolvedParameters.some(
          existingParam =>
            isParameter(existingParam) &&
            isParameter(paramToPush) &&
            existingParam.name === paramToPush.name &&
            (existingParam.in ?? '') === (paramToPush.in ?? ''),
        );

        if (isDuplicate) {
          paramToPush = {
            ...paramToPush,
            name: `masked-duplicate-${String(paramToPush.name)}`,
          };
        }

        resolvedParameters.push(paramToPush);
      }
    });
  }

  if (step.parameters) {
    step.parameters.forEach(param => {
      let paramToPush = param;

      if (isPlainObject(param) && 'reference' in param) {
        const resolvedParam = resolveReusableParameters(param, components);
        if (resolvedParam) {
          paramToPush = resolvedParam;
        }
      }

      if (isParameter(paramToPush)) {
        const isDuplicate = resolvedStepParameters.some(
          existingParam =>
            isParameter(existingParam) &&
            isParameter(paramToPush) &&
            existingParam.name === paramToPush.name &&
            (existingParam.in ?? '') === (paramToPush.in ?? ''),
        );

        if (isDuplicate) {
          paramToPush = {
            ...paramToPush,
            name: `masked-duplicate-${String(paramToPush.name)}`,
          };
        }

        resolvedStepParameters.push(paramToPush);
      }
    });
  }

  resolvedStepParameters.forEach(param => {
    const existingParamIndex = resolvedParameters.findIndex(
      p => isParameter(p) && p.name === param.name && (p.in ?? '') === (param.in ?? ''),
    );
    if (existingParamIndex !== -1) {
      resolvedParameters[existingParamIndex] = param;
    } else {
      resolvedParameters.push(param);
    }
  });

  return resolvedParameters;
}
