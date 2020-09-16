import { Segment } from '@stoplight/types';
import { isObject } from 'lodash';
import { Replacer } from '../utils/replacer';

export interface IMessageVars {
  property: Segment;
  error: string;
  description: string | null;
  value: unknown;
  path: string;
}

export type MessageInterpolator = (str: string, values: IMessageVars) => string;

const MessageReplacer = new Replacer<IMessageVars>(2);

MessageReplacer.addFunction('printProperty', ({ property }) => {
  if (property !== void 0) {
    return `\`${property}\` property `;
  }

  return '';
});

MessageReplacer.addFunction('printValue', ({ value }) => {
  if (isObject(value)) {
    return Array.isArray(value) ? 'Array[]' : 'Object{}';
  }

  return JSON.stringify(value);
});

export const message: MessageInterpolator = MessageReplacer.print.bind(MessageReplacer);
