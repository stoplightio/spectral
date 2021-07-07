import { Segment } from '@stoplight/types';
import { printValue } from '@stoplight/spectral-runtime';
import { Replacer } from '../../utils/replacer';

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
      if (property !== void 0 && property !== '') {
        return `"${property}" property `;
      }

      return `The document `;
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
