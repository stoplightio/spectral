export interface IMessageVars {
  property: string | number;
  error: string;
  description?: string;
}

export type MessageInterpolator = (values: IMessageVars) => string;

export function message(strings: TemplateStringsArray, ...vars: Array<keyof IMessageVars>) {
  return (values: IMessageVars) => {
    const result = [strings[0]];

    for (const [i, key] of vars.entries()) {
      result.push(String(values[key] || ''), strings[i + 1]);
    }

    return result.join('');
  };
}
