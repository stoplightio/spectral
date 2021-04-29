import { isObject } from 'lodash';
import { Dictionary } from '@stoplight/types';

type MaybeOAS2 = { swagger: unknown } & Dictionary<unknown>;
type MaybeOAS3 = { openapi: unknown } & Dictionary<unknown>;

export const isOpenApiv2 = (document: unknown): document is { swagger: string | number } & Dictionary<unknown> =>
  isObject(document) && 'swagger' in document && parseInt(String((document as MaybeOAS2).swagger)) === 2;

export const isOpenApiv3 = (document: unknown): document is { openapi: string | number } & Dictionary<unknown> =>
  isObject(document) && 'openapi' in document && parseInt(String((document as MaybeOAS3).openapi)) === 3;

export const isOpenApiv3_0 = (document: unknown): boolean =>
  isOpenApiv3(document) && parseFloat(String(document.openapi)) === 3;

export const isOpenApiv3_1 = (document: unknown): boolean =>
  isOpenApiv3(document) && parseFloat(String(document.openapi)) === 3.1;
