import { Segment } from '@stoplight/types';
import { isObject } from 'lodash';
import { Replacer } from '../utils/replacer';

export interface IMessageVars {
  property: Segment;
  error: string;
  description?: string;
  value: unknown;
  path: string;
}

export type MessageInterpolator = (str: string, values: IMessageVars) => string;

const MessageReplacer = new Replacer<IMessageVars>(2);

MessageReplacer.addTransformer('double-quotes', (id, value) => (value ? `"${value}"` : ''));
MessageReplacer.addTransformer('single-quotes', (id, value) => (value ? `'${value}'` : ''));
MessageReplacer.addTransformer('gravis', (id, value) => (value ? `\`${value}\`` : ''));

MessageReplacer.addTransformer('append-property', (id, value) => (value ? `${value} property ` : ''));
MessageReplacer.addTransformer('optional-typeof', (id, value, values) =>
  value ? String(value) : `${typeof values.value} `,
);

MessageReplacer.addTransformer('to-string', (id, value) => {
  if (isObject(value)) {
    return Array.isArray(value) ? 'Array[]' : 'Object{}';
  }

  return JSON.stringify(value);
});

export const message: MessageInterpolator = MessageReplacer.print.bind(MessageReplacer);
