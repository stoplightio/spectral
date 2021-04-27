// based on https://github.com/seriousme/ajv-formats/blob/c2399d0bf1370b271db7138b4fe677f58bde3efa/src/formats.ts
// can be removed once 2.1.0 is released
import { Dictionary } from '@stoplight/types';
import type { Format } from 'ajv';

export const oasFormats: Dictionary<Format> = {
  // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
  // byte: https://github.com/miguelmota/is-base64
  byte: /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm,
  // signed 32 bit integer
  int32: { type: 'number', validate: validateInt32 },
  // signed 64 bit integer
  int64: { type: 'number', validate: validateInt64 },
  // C-type float
  float: { type: 'number', validate: validateNumber },
  // C-type double
  double: { type: 'number', validate: validateNumber },
  // hint to the UI to hide input strings
  password: true,
  // unchecked string payload
  binary: true,
};

const MIN_INT32 = -(2 ** 31);
const MAX_INT32 = 2 ** 31 - 1;

function validateInt32(value: number): boolean {
  return Number.isInteger(value) && value <= MAX_INT32 && value >= MIN_INT32;
}

function validateInt64(value: number): boolean {
  // JSON and javascript max Int is 2**53, so any int that passes isInteger is valid for Int64
  return Number.isInteger(value);
}

function validateNumber(): boolean {
  return true;
}
