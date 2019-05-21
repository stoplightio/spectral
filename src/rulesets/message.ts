export interface IMessageVars {
  property: string | number;
  error: string;
  description?: string;
}

export type MessageInterpolator = (str: string, values: IMessageVars) => string;

const BRACES = /{{([^}]+)}}/g;

export const message: MessageInterpolator = (str, values) => {
  BRACES.lastIndex = 0;
  let result: RegExpExecArray | null = null;

  // tslint:disable-next-line:no-conditional-assignment
  while ((result = BRACES.exec(str))) {
    str = `${str.slice(0, result.index)}${String(values[result[1]] || '')}${str.slice(BRACES.lastIndex)}`;
    BRACES.lastIndex = result.index;
  }

  return str;
};
