import { alphabetical } from './alphabetical';
import { casing } from './casing';
import { enumeration } from './enumeration';
import { falsy } from './falsy';
import { length } from './length';
import { pattern } from './pattern';
import { schema } from './schema';
import { schemaPath } from './schema-path';
import { truthy } from './truthy';
import { typedEnum } from './typedEnum';
import { undefined } from './undefined';
import { unreferencedReusableObject } from './unreferencedReusableObject';
import { xor } from './xor';

export const functions = {
  alphabetical,
  casing,
  enumeration,
  length,
  pattern,
  falsy,
  schema,
  schemaPath,
  truthy,
  undefined,
  xor,
  unreferencedReusableObject,
  typedEnum,
};

export type CoreFunctions = typeof functions;
