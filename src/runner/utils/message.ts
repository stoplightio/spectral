import { Segment } from '@stoplight/types';
import { Replacer } from '../../utils/replacer';
import { printValue } from '../../utils/printValue';

export type MessageVars = {
  property: Segment;
  error: string;
  description: string | null;
  value: unknown;
  path: string;
};

export type MessageInterpolator = (str: string, values: MessageVars) => string;

const MessageReplacer = new Replacer<MessageVars>(2);

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
      return printValue(value);
    default:
      if (type in this && this[type] !== null) {
        return String(this[type]);
      }

      return '';
  }
});

export const message: MessageInterpolator = MessageReplacer.print.bind(MessageReplacer);
