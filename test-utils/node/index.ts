import * as nock from 'nock';
import * as nodeFs from 'fs';
import { URL } from 'url';
import { dirname, isURL } from '@stoplight/path';
import { fs as memFs } from 'memfs';

const fs = new Proxy(nodeFs, {
  get(target, key) {
    if (target[key] !== memFs[key]) {
      throw new Error('jest.mock is not correctly hooked up and memfs is not in use. Aborting for security reasons');
    }

    return Reflect.get(target, key, target);
  },
});

afterEach(() => {
  nock.cleanAll();
  try {
    fs.rmdirSync(__dirname, { recursive: true });
  } catch {
    //
  }
});

type Body = string | Record<string, unknown>;

export function serveAssets(mocks: Record<string, Body>): void {
  for (const [uri, body] of Object.entries(mocks)) {
    if (!isURL(uri)) {
      fs.mkdirSync(dirname(uri), { recursive: true });
      fs.writeFileSync(uri, typeof body === 'string' ? body : JSON.stringify(body));
      continue;
    }

    mockResponse(uri, 200, body);
  }
}

function mockResponse(uri: string, code: number, body: Body): void {
  const { origin, pathname, searchParams } = new URL(uri);

  const query = {};
  for (const [key, val] of searchParams.entries()) {
    query[key] = val;
  }

  const scope = nock(origin).persist(true);

  if (Object.keys(query).length > 0) {
    scope
      .get(RegExp(pathname.replace(/\/$/, '').replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\/?$'))
      .query(query)
      .reply(code, body);
  } else {
    scope.get(pathname).reply(code, body);
  }
}

export function mockResponses(mocks: Record<string, Record<number, Body>>): void {
  for (const [uri, responses] of Object.entries(mocks)) {
    for (const [code, body] of Object.entries(responses)) {
      mockResponse(uri, Number(code), body);
    }
  }
}
