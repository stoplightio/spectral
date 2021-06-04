import { FetchMockSandbox } from 'fetch-mock';

let fetchMock: FetchMockSandbox;
let fetchDesc: PropertyDescriptor;

beforeEach(() => {
  fetchMock = require('fetch-mock').default.sandbox();
  // fetchMock.config.fetch = fetch;
  fetchMock.config.fallbackToNetwork = false;
  fetchDesc = Object.getOwnPropertyDescriptor(global, 'fetch')!;
  window.fetch = fetchMock;
});

afterEach(() => {
  fetchMock.restore();
  Object.defineProperty(window, 'fetch', fetchDesc);
});

export default function (mocks: Record<string, unknown>): void {
  for (const [url, body] of Object.entries(mocks)) {
    for (const actualUrl of new Set([url.replace(/([^/])\?/, '$1/?'), url.replace(/([^/])\?/, '$1?')])) {
      fetchMock.mock(actualUrl, {
        status: 200,
        body,
      });
    }
  }
}
