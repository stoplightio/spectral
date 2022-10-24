import { fetch as defaultFetch } from '@stoplight/spectral-runtime';
import { isURL, extname } from '@stoplight/path';
import type { Fetch } from '../types';

function stripSearchFromUrl(url: string): string {
  try {
    const { href, search } = new URL(url);
    return href.slice(0, href.length - search.length);
  } catch {
    return url;
  }
}

const CONTENT_TYPE_REGEXP = /^(?:application|text)\/(?:yaml|json)(?:;|$)/i;
const EXT_REGEXP = /\.(json|ya?ml)$/i;

export async function isBasicRuleset(uri: string, fetch: Fetch = defaultFetch): Promise<boolean> {
  const ext = extname(isURL(uri) ? stripSearchFromUrl(uri) : uri);

  if (EXT_REGEXP.test(ext)) {
    return true;
  }

  if (!isURL(uri)) {
    return false;
  }

  try {
    const contentType = (await fetch(uri)).headers.get('Content-Type');
    return contentType !== null && CONTENT_TYPE_REGEXP.test(contentType);
  } catch {
    return false;
  }
}
