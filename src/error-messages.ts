import { DiagnosticSeverity, IParserResult } from '@stoplight/types';
import { uniqBy } from 'lodash';
import { Resolved } from './resolved';
import { IRuleResult } from './types';

const toUpperCase = (word: string) => word.toUpperCase();
const splitWord = (word: string, end: string, start: string) => `${end} ${start.toLowerCase()}`;

export function prettifyDiagnosticErrorMessage(message: string) {
  return message.replace(/^[a-z]/, toUpperCase).replace(/([a-z])([A-Z])/g, splitWord);
}

export const prettyPrintResolverErrorMessage = (message: string) => message.replace(/^Error\s*:\s*/, '');

export function formatParserDiagnostics(parsed: IParserResult, source?: string): IRuleResult[] {
  return parsed.diagnostics.map(diagnostic => ({
    ...diagnostic,
    code: 'parser',
    message: prettifyDiagnosticErrorMessage(diagnostic.message),
    path: [],
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
