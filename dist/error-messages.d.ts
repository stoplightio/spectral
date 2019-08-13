import { IDiagnostic } from '@stoplight/types';
import { Resolved } from './resolved';
import { IRuleResult } from './types';
export declare function getDiagnosticErrorMessage(diagnostic: IDiagnostic): string;
export declare const prettyPrintResolverErrorMessage: (message: string) => string;
export declare function formatParserDiagnostics(diagnostics: IDiagnostic[], source?: string): IRuleResult[];
export declare const formatResolverErrors: (resolved: Resolved) => IRuleResult[];
