import { isAbsolute, join } from '@stoplight/path';
import { Optional } from '@stoplight/types';
import { createHttpAndFileResolver } from '../../../../resolvers/http-and-file';
import type { Resolver } from '@stoplight/json-ref-resolver';

export const getResolver = (resolver: Optional<string>): Resolver => {
  if (resolver !== void 0) {
    try {
      return require(isAbsolute(resolver) ? resolver : join(process.cwd(), resolver));
    } catch ({ message }) {
      throw new Error(formatMessage(message) ?? message);
    }
  }

  return createHttpAndFileResolver();
};

function formatMessage(message: string): Optional<string> {
  return message.split(/\r?\n/)?.[0]?.replace(/\\/g, '/');
}
