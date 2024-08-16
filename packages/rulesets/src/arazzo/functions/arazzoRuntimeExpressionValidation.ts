type Workflow = {
  steps: Step[];
};

type Step = {
  stepId: string;
  outputs?: { [key: string]: string };
};

function arazzoRuntimeExpressionValidation(expression: string, _workflow: Workflow): boolean {
  const validPrefixes = [
    '$url',
    '$method',
    '$statusCode',
    '$request.',
    '$response.',
    '$message.',
    '$inputs.',
    '$outputs.',
    '$steps.',
    '$workflows.',
    '$sourceDescriptions.',
    '$components.',
    '$components.parameters.',
  ];
  const isValidPrefix = validPrefixes.some(prefix => expression.startsWith(prefix));

  if (!isValidPrefix) {
    return false;
  }

  // ToDo: Advanced validation logic can be added here
  // For example, validate $steps.foo.outputs.bar references

  return true;
}

export default arazzoRuntimeExpressionValidation;
