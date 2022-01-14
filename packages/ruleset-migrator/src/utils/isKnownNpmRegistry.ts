import { parse } from '@stoplight/path';

const KNOWN_PROVIDERS = ['unpkg.com', 'cdn.skypack.dev'];

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
