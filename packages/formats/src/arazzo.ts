import type { Format } from '@stoplight/spectral-core';
import { isPlainObject } from '@stoplight/json';

type MaybeArazzo = { arazzo: unknown } & Record<string, unknown>;

const arazzo1_0Regex = /^1\.0(?:\.[0-9]*)?$/;

const isArazzo = (document: unknown): document is { arazzo: string } & Record<string, unknown> =>
  isPlainObject(document) && 'arazzo' in document && arazzo1_0Regex.test(String((document as MaybeArazzo).arazzo));

export const arazzo1_0: Format = isArazzo;
arazzo1_0.displayName = 'Arazzo 1.0.x';
