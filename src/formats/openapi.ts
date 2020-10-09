import { isObject } from 'lodash';

type MaybeOAS2 = Partial<{ swagger: unknown }>;
type MaybeOAS3 = Partial<{ openapi: unknown }>;

export const isOpenApiv2 = (document: unknown): boolean =>
  isObject(document) && 'swagger' in document && parseInt(String((document as MaybeOAS2).swagger)) === 2;

export const isOpenApiv3 = (document: unknown): boolean =>
  isObject(document) && 'openapi' in document && parseFloat(String((document as MaybeOAS3).openapi)) === 3;

export const isOpenApiv3_1 = (document: unknown): boolean =>
  isObject(document) && 'openapi' in document && parseFloat(String((document as MaybeOAS3).openapi)) === 3.1;
