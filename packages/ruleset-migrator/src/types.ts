import type { Tree } from './tree';
import type { Ruleset } from './validation/types';
import type { ExpressionKind } from 'ast-types/gen/kinds';

export type MigrationOptions = {
  cwd?: string;
  fs: {
    promises: {
      readFile: typeof import('fs').promises.readFile; // todo: include @types/node in deps?
    };
  };
  npmRegistry?: string;
  format?: 'esm' | 'commonjs';
};

export type Hook = [pattern: RegExp, hook: (input: unknown) => ExpressionKind];

export type Transformer = (ctx: TransformerCtx) => void;

export type TransformerCtx = {
  readonly tree: Tree;
  readonly ruleset: Ruleset;
  readonly hooks: Set<Hook>;
};
