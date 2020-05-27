import { DiagnosticSeverity } from '@stoplight/types';
import { IDocument } from '../document';
import { Document } from '../document';
import { IRuleResult } from '../types/spectral';

export const generateDocumentWideResult = (
  document: IDocument,
  message: string,
  severity: DiagnosticSeverity,
  code?: string | number,
): IRuleResult => {
  return {
    range: document.getRangeForJsonPath([], true) ?? Document.DEFAULT_RANGE,
    message,
    code,
    severity,
    ...(document.source !== null && { source: document.source }),
    path: [],
  };
};
