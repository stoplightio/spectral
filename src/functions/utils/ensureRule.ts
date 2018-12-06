import { ValidationSeverity, ValidationSeverityLabel } from '@stoplight/types/validations';
import { IRuleMetadata, IRuleResult } from '../../types';

export const ensureRule = (shouldAssertion: Function, ruleMeta: IRuleMetadata): void | IRuleResult => {
  try {
    shouldAssertion();
  } catch (error) {
    // rethrow when not a lint error
    if (!error.name || error.name !== 'AssertionError') {
      throw error;
    }

    return {
      path: ruleMeta.path,
      name: ruleMeta.name,
      type: ruleMeta.rule.type,
      description: ruleMeta.rule.summary,
      severity: ruleMeta.rule.severity || ValidationSeverity.Warn,
      severityLabel: ruleMeta.rule.severityLabel || ValidationSeverityLabel.Warn,
      message: error.message ? error.message : '',
    };
  }
};

export function shouldHaveProperty(object: any, property: string | string[]) {
  if (Array.isArray(property)) {
    object.should.have.propertyByPath(...property);
  } else {
    object.should.have.property(property);
  }
}
