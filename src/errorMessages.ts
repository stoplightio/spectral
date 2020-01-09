import { IResolveError } from '@stoplight/json-ref-resolver/types';
import { DiagnosticSeverity, IDiagnostic, JsonPath, Optional, Segment } from '@stoplight/types';
import { uniqBy } from 'lodash';
import { Document, IDocument } from './document';
import { IRuleResult } from './types';

const toUpperCase = (word: string) => word.toUpperCase();
const splitWord = (word: string, end: string, start: string) => `${end} ${start.toLowerCase()}`;

export function getDiagnosticErrorMessage(diagnostic: IDiagnostic) {
  const key = getPropertyKey(diagnostic.path);
  let prettifiedMessage = diagnostic.message.replace(/^[a-z]/, toUpperCase);

  if (diagnostic.code !== 'YAMLException') {
    // yaml exceptions are already fairly user-friendly
    prettifiedMessage = prettifiedMessage.replace(/([a-z])([A-Z])/g, splitWord);
  }

  if (key !== undefined) {
    prettifiedMessage = prettifiedMessage.replace(/(Duplicate key)/, `$1: ${key}`);
  }

  return prettifiedMessage;
}

export const prettyPrintResolverErrorMessage = (message: string) => message.replace(/^Error\s*:\s*/, '');

const getPropertyKey = (path: JsonPath | undefined): Segment | void => {
  if (path !== undefined && path.length > 0) {
    return path[path.length - 1];
  }
};

export function formatParserDiagnostics(
  diagnostics: ReadonlyArray<IDiagnostic>,
  source: Optional<string>,
): IRuleResult[] {
  return diagnostics.map(diagnostic => ({
    ...diagnostic,
    code: 'parser',
    message: getDiagnosticErrorMessage(diagnostic),
    path: diagnostic.path || [],
    source,
  }));
}

export const formatResolverErrors = (document: IDocument, diagnostics: IResolveError[]): IRuleResult[] => {
  return uniqBy(diagnostics, 'message').map<IRuleResult>(error => {
    const path = [...(error.path || []), '$ref'];
    const range = document.getRangeForJsonPath(path, true) || Document.DEFAULT_RANGE;

    return {
      code: 'invalid-ref',
      path,
      message: prettyPrintResolverErrorMessage(error.message),
      severity: DiagnosticSeverity.Error,
      range,
      source: error.uriStack.length > 0 ? error.uriStack[error.uriStack.length - 1] : document.source,
    };
  });
};
