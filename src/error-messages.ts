import { DiagnosticSeverity, IDiagnostic, Segment } from '@stoplight/types';
import { JsonPath } from '@stoplight/types/dist';
import { uniqBy } from 'lodash';
import { Resolved } from './resolved';
import { IRuleResult } from './types';

const toUpperCase = (word: string) => word.toUpperCase();
const splitWord = (word: string, end: string, start: string) => `${end} ${start.toLowerCase()}`;

export function prettifyDiagnosticErrorMessage(message: string, key: Segment | void) {
  const prettifiedMessage = message.replace(/^[a-z]/, toUpperCase).replace(/([a-z])([A-Z])/g, splitWord);

  if (key !== undefined) {
    return prettifiedMessage.replace(/(Duplicate key)/, `$1: ${key}`);
  }

  return prettifiedMessage;
}

export const prettyPrintResolverErrorMessage = (message: string) => message.replace(/^Error\s*:\s*/, '');

const getPropertyKey = (path: JsonPath | undefined): Segment | void => {
  if (path !== undefined && path.length > 0) {
    return path[path.length - 1];
  }
};

export function formatParserDiagnostics(diagnostics: IDiagnostic[], source?: string): IRuleResult[] {
  return diagnostics.map(diagnostic => ({
    ...diagnostic,
    code: 'parser',
    message: prettifyDiagnosticErrorMessage(diagnostic.message, getPropertyKey(diagnostic.path)),
    path: diagnostic.path || [],
    source,
  }));
}

export const formatResolverErrors = (resolved: Resolved): IRuleResult[] => {
  return uniqBy(resolved.errors, 'message').reduce<IRuleResult[]>((errors, error) => {
    const path = [...error.path, '$ref'];
    const location = resolved.getLocationForJsonPath(path);

    if (location) {
      errors.push({
        code: 'invalid-ref',
        path,
        message: prettyPrintResolverErrorMessage(error.message),
        severity: DiagnosticSeverity.Error,
        range: location.range,
        source: resolved.spec.source,
      });
    }

    return errors;
  }, []);
};
