import * as mm from 'minimatch';

const DEFAULT_OPTS = { matchBase: true };

export function minimatch(source: string, pattern: string): boolean {
  return mm(source, pattern, DEFAULT_OPTS);
}
