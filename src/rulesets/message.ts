import { Segment } from '@stoplight/types';

export interface IMessageVars {
  property: Segment;
  error: string;
  description?: string;
  value: unknown;
  path: string;
}

export type MessageInterpolator = (str: string, values: IMessageVars) => string;

const BRACES = /{{([^}]+)}}/g;

export const message: MessageInterpolator = (str, values) => {
  BRACES.lastIndex = 0;
  let result: RegExpExecArray | null = null;

  // tslint:disable-next-line:no-conditional-assignment
  while ((result = BRACES.exec(str))) {
    const newValue = String(values[result[1]] || '');
    str = `${str.slice(0, result.index)}${newValue}${str.slice(BRACES.lastIndex)}`;
    BRACES.lastIndex = result.index + newValue.length;
  }

  return str;
};
