import type { Format } from '@stoplight/spectral-core';
import { isPlainObject } from '@stoplight/json';

type MaybeOAS2 = { swagger: unknown } & Record<string, unknown>;
type MaybeOAS3 = { openapi: unknown } & Record<string, unknown>;

export const oas2: Format = (document: unknown): boolean =>
  isPlainObject(document) && 'swagger' in document && parseInt(String((document as MaybeOAS2).swagger)) === 2;

oas2.displayName = 'OpenAPI 2.0 (Swagger)';

const isOas3 = (document: unknown): document is { openapi: string | number } & Record<string, unknown> =>
  isPlainObject(document) && 'openapi' in document && Number.parseInt(String((document as MaybeOAS3).openapi)) === 3;

export const oas3: Format = isOas3;
oas3.displayName = 'OpenAPI 3.x';

export const oas3_0: Format = (document: unknown): boolean =>
  isOas3(document) && /^3\.0(?:\.[0-9]*)?$/.test(String(document.openapi));
oas3_0.displayName = 'OpenAPI 3.0.x';

export const oas3_1: Format = (document: unknown): boolean =>
  isOas3(document) && /^3\.1(?:\.[0-9]*)?$/.test(String(document.openapi));
oas3_1.displayName = 'OpenAPI 3.1.x';
