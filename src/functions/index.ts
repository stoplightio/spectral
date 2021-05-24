import { alphabetical } from './alphabetical';
import { casing } from './casing';
import { defined } from './defined';
import { enumeration } from './enumeration';
import { falsy } from './falsy';
import { length } from './length';
import { pattern } from './pattern';
import { schema } from './schema';
import { truthy } from './truthy';
import { undefined } from './undefined';
import { unreferencedReusableObject } from './unreferencedReusableObject';
import { xor } from './xor';

export const functions = {
  alphabetical,
  casing,
  defined,
  enumeration,
  length,
  pattern,
  falsy,
  schema,
  truthy,
  undefined,
  xor,
  unreferencedReusableObject,
};

export type CoreFunctions = typeof functions;
