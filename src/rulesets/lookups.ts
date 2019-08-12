const isObject = (thing: unknown): thing is object => thing !== null && typeof thing === 'object';

type MaybeOAS2 = Partial<{ swagger: unknown }>;
type MaybeOAS3 = Partial<{ openapi: unknown }>;

export const isOpenApiv2_0 = (document: unknown) =>
  isObject(document) && 'swagger' in document && parseInt(String((document as MaybeOAS2).swagger)) === 2;

export { isOpenApiv2_0 as isOpenAPIv2 };

export const isOpenApiv3 = (document: unknown) =>
  isObject(document) && 'openapi' in document && parseInt(String((document as MaybeOAS3).openapi)) === 3;

export const isOpenApiv3_0 = (document: unknown) =>
  isOpenApiv3(document) && parseFloat(String((document as MaybeOAS3).openapi)) === 3;

export const isOpenApiv3_1 = (document: unknown) =>
  isOpenApiv3(document) && parseFloat(String((document as MaybeOAS3).openapi)) === 3.1;
