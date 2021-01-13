import { Segment } from '@stoplight/types';
import { isObject } from 'lodash';
import { Replacer } from '../../utils/replacer';

export interface IMessageVars {
  property: Segment;
  error: string;
  description: string | null;
  value: unknown;
  path: string;
}

export type MessageInterpolator = (str: string, values: IMessageVars) => string;

const MessageReplacer = new Replacer<IMessageVars>(2);

MessageReplacer.addFunction('print', function (type) {
  if (typeof type !== 'string') return '';
  const { property, value } = this;
  switch (type) {
    case 'property':
      if (property !== void 0) {
        return `\`${property}\` property `;
      }

      return '';
    case 'value':
      if (isObject(value)) {
        return Array.isArray(value) ? 'Array[]' : 'Object{}';
      }

      return JSON.stringify(value);
    default:
      if (type in this && this[type] !== null) {
        return String(this[type]);
      }

      return '';
  }
});

export const message: MessageInterpolator = MessageReplacer.print.bind(MessageReplacer);
