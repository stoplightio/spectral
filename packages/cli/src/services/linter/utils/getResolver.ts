import { isAbsolute, join } from '@stoplight/path';
import { Optional } from '@stoplight/types';
import { createHttpAndFileResolver, Resolver } from '@stoplight/spectral-ref-resolver';
import { isError } from 'lodash';
import { CLIError } from '../../../errors';

export const getResolver = (resolver: Optional<string>): Resolver => {
  if (resolver !== void 0) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return require(isAbsolute(resolver) ? resolver : join(process.cwd(), resolver));
    } catch (ex) {
      throw new CLIError(isError(ex) ? formatMessage(ex.message) : String(ex));
    }
  }

  return createHttpAndFileResolver();
};

function formatMessage(message: string): Optional<string> {
  return message.split(/\r?\n/)?.[0]?.replace(/\\/g, '/');
}
