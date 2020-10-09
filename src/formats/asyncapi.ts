import { isObject } from 'lodash';

type MaybeAsyncApi2 = Partial<{ asyncapi: unknown }>;

const bearsAStringPropertyNamed = (document: unknown, propertyName: string): boolean => {
  return isObject(document) && propertyName in document && typeof document[propertyName] === 'string';
};

const version2Regex = /^2\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;

export const isAsyncApiv2 = (document: unknown): boolean => {
  if (!bearsAStringPropertyNamed(document, 'asyncapi')) {
    return false;
  }

  const version = String((document as MaybeAsyncApi2).asyncapi);

  return version2Regex.test(version);
};
