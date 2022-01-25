/// <reference lib="dom" />

import type { Tree } from './tree';
import type { ExpressionKind } from 'ast-types/gen/kinds';
import { Ruleset } from './validation/types';

export type Fetch = Window['fetch'] | typeof import('@stoplight/spectral-runtime').fetch;

export type MigrationOptions = {
  fs: {
    promises: {
      readFile: typeof import('fs').promises.readFile;
    };
  };
  fetch?: Fetch;
} & (
  | {
      format?: 'esm';
      npmRegistry?: string;
    }
  | {
      format?: 'commonjs';
      npmRegistry?: never;
    }
);

export type Hook = [
  pattern: RegExp,
  hook: (input: unknown, ctx: TransformerCtx) => Promise<ExpressionKind | null | void> | ExpressionKind | null | void,
];

export type Transformer = (hooks: Set<Hook>) => void;

export type TransformerCtx = {
  readonly tree: Tree;
  readonly opts: MigrationOptions & {
    fetch: Fetch;
  };
  readonly hooks: Set<Hook>;
  readonly cwd: string;
  readonly filepath: string;
  readonly npmRegistry: string | null;
  read(filepath: string, fs: MigrationOptions['fs'], fetch: Fetch): Promise<Ruleset>;
};
