import alphabetical from './alphabetical';
import casing from './casing';
import defined from './defined';
import enumeration from './enumeration';
import falsy from './falsy';
import length from './length';
import pattern from './pattern';
import schema from './schema';
import truthy from './truthy';
import _undefined from './undefined';
import unreferencedReusableObject from './unreferencedReusableObject';
import xor from './xor';

const functions = {
  alphabetical,
  casing,
  defined,
  enumeration,
  length,
  pattern,
  falsy,
  schema,
  truthy,
  undefined: _undefined,
  xor,
  unreferencedReusableObject,
};

export { functions as default };

export type CoreFunctions = typeof functions;

export {
  alphabetical,
  casing,
  defined,
  enumeration,
  falsy,
  length,
  pattern,
  schema,
  truthy,
  _undefined as undefined,
  unreferencedReusableObject,
  xor,
};
