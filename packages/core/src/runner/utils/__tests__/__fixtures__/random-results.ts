import { DiagnosticSeverity } from '@stoplight/types';
import type { ISpectralDiagnostic } from '../../../../types';

export const results: ISpectralDiagnostic[] = [
  {
    code: 'code 01',
    path: ['a', 'b', 'c', 'd'],
    source: 'source 01',
    range: {
      start: { line: 1, character: 1 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 01',
    path: ['a', 'b', 'c', 'd'],
    source: 'source 02',
    range: {
      start: { line: 1, character: 1 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 01',
    path: ['a', 'b', 'c', 'd'],
    source: 'source 02',
    range: {
      start: { line: 2, character: 1 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 01',
    path: ['a', 'b', 'c', 'd'],
    source: 'source 02',
    range: {
      start: { line: 2, character: 2 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 02',
    path: ['a', 'b', 'c', 'd'],
    source: 'source 02',
    range: {
      start: { line: 2, character: 2 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 02',
    path: ['a', 'b', 'c', 'e'],
    source: 'source 02',
    range: {
      start: { line: 2, character: 2 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 02',
    path: ['a', 'b', 'c', 'f'],
    source: 'source 02',
    range: {
      start: { line: 2, character: 2 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 03',
    path: ['a', 'b', 'c', 'f'],
    source: 'source 02',
    range: {
      start: { line: 2, character: 2 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 03',
    path: ['a', 'b', 'c', 'f'],
    source: 'source 02',
    range: {
      start: { line: 2, character: 3 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 03',
    path: ['a', 'b', 'c', 'f'],
    source: 'source 02',
    range: {
      start: { line: 3, character: 3 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 03',
    path: ['a', 'b', 'c', 'f'],
    source: 'source 03',
    range: {
      start: { line: 3, character: 3 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
];
