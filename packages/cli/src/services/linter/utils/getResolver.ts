import { isAbsolute, join } from '@stoplight/path';
import { Optional } from '@stoplight/types';
import { createHttpAndFileResolver, Resolver } from '@stoplight/spectral-ref-resolver';
import { isError } from 'lodash';

export const getResolver = (resolver: Optional<string>, proxy: Optional<string>): Resolver => {
  if (resolver !== void 0) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return require(isAbsolute(resolver) ? resolver : join(process.cwd(), resolver));
    } catch (e) {
      throw new Error(
        isError(e) ? formatMessage(e.message) ?? e.message : 'Encountered unknown error when loading the resolver',
      );
    }
  }

  if (typeof proxy === 'string') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ProxyAgent = require('proxy-agent') as typeof import('proxy-agent');
    return createHttpAndFileResolver({ agent: new ProxyAgent(process.env.PROXY) });
  }

  return createHttpAndFileResolver();
};

function formatMessage(message: string): Optional<string> {
  return message.split(/\r?\n/)?.[0]?.replace(/\\/g, '/');
}
