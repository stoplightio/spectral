import { isObject } from 'lodash';

type MaybeOAS2 = Partial<{ swagger: unknown }>;
type MaybeOAS3 = Partial<{ openapi: unknown }>;

const bearsAStringPropertyNamed = (document: unknown, propertyName: string) => {
  return isObject(document) && propertyName in document && typeof document[propertyName] === 'string';
};

export const isOpenApiv2 = (document: unknown) =>
  bearsAStringPropertyNamed(document, 'swagger') && String((document as MaybeOAS2).swagger) === '2.0';

export const isOpenApiv3 = (document: unknown) =>
  bearsAStringPropertyNamed(document, 'openapi') && parseFloat(String((document as MaybeOAS3).openapi)) === 3;

export const isOpenApiv3_1 = (document: unknown) =>
  bearsAStringPropertyNamed(document, 'openapi') && parseFloat(String((document as MaybeOAS3).openapi)) === 3.1;
