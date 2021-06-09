import { dirname, isURL } from '@stoplight/path';
import * as fs from 'fs';

let fetchMock;
let fetchDesc;

beforeEach(() => {
  fetchMock = require('fetch-mock').default.sandbox();
  // fetchMock.config.fetch = fetch;
  fetchMock.config.fallbackToNetwork = false;
  fetchDesc = Object.getOwnPropertyDescriptor(global, 'fetch');
  window.fetch = fetchMock;
});

afterEach(() => {
  fetchMock.restore();
  Object.defineProperty(window, 'fetch', fetchDesc);
});

export function serveAssets(mocks) {
  for (const [uri, body] of Object.entries(mocks)) {
    if (!isURL(uri)) {
      fs.mkdirSync(dirname(uri), { recursive: true });
      fs.writeFileSync(uri, JSON.stringify(body));
      continue;
    }

    for (const actualUrl of new Set([uri.replace(/([^/])\?/, '$1/?'), uri.replace(/([^/])\?/, '$1?')])) {
      fetchMock.mock(actualUrl, {
        status: 200,
        body,
      });
    }
  }
}
