import type { Format } from '@stoplight/spectral-core';
import { isPlainObject } from '@stoplight/json';

type MaybeAsyncApi2 = Partial<{ asyncapi: unknown }>;

const bearsAStringPropertyNamed = (document: unknown, propertyName: string): boolean => {
  return isPlainObject(document) && propertyName in document && typeof document[propertyName] === 'string';
};

const version2Regex = /^2\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;

export const asyncApi2: Format = document => {
  if (!bearsAStringPropertyNamed(document, 'asyncapi')) {
    return false;
  }

  const version = String((document as MaybeAsyncApi2).asyncapi);

  return version2Regex.test(version);
};

asyncApi2.displayName = 'AsyncAPI 2.x';

export { asyncApi2 as asyncapi2 };
