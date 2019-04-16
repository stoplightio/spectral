import { IArray, IObject, ISchema } from './types';

export function optional(type: any) {
  return {
    ...type,
    optional: true,
  };
}

export function object(value: ISchema): IObject {
  return {
    type: 'object',
    value,
  };
}

export function anEnum(values: any[]) {
  return {
    type: 'enum',
    values,
  };
}

export function primitive(type: 'string' | 'boolean' | 'any') {
  return {
    type,
  };
}

export function array(of: any): IArray {
  return {
    type: 'array',
    of,
  };
}
