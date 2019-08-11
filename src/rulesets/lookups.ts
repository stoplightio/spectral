const isObject = (thing: unknown): thing is object => thing !== null && typeof thing === 'object';

type MaybeOAS2Spec = Partial<{ swagger: unknown }>;
type MaybeOAS3Spec = Partial<{ openapi: unknown }>;

export const isOAS2Spec = (document: unknown) =>
  isObject(document) && 'swagger' in document && parseInt(String((document as MaybeOAS2Spec).swagger)) === 2;
export const isOAS3Spec = (document: unknown) =>
  isObject(document) && 'openapi' in document && parseInt(String((document as MaybeOAS3Spec).openapi)) === 3;
