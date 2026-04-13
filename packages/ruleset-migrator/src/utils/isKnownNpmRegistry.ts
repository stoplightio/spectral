import { parse } from '@stoplight/path';

const KNOWN_PROVIDERS = ['unpkg.com', 'esm.sh'];

export function isKnownNpmRegistry(uri: string): boolean {
  const { protocol, origin } = parse(uri);
  if (origin === null) {
    return false;
  }

  if (protocol !== 'http' && protocol !== 'https') {
    return false;
  }

  return KNOWN_PROVIDERS.includes(origin);
}
