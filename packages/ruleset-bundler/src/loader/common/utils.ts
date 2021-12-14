import * as path from '@stoplight/path';

export function isBasicRuleset(filepath: string): boolean {
  return /\.(json|ya?ml)$/.test(path.extname(filepath));
}

export function isErrorWithCode(error: unknown): error is Error & { code: string } {
  return error instanceof Error && 'code' in error && typeof (error as Error & { code: unknown }).code === 'string';
}
