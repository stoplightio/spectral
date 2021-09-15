import * as nock from 'nock';
import * as fs from 'fs';
import { URL } from 'url';
import { dirname, isURL } from '@stoplight/path';
import { fs as memFs } from 'memfs';

if (fs.mkdirSync !== memFs.mkdirSync || fs.writeFileSync !== memFs.writeFileSync || fs.rmdirSync !== memFs.rmdirSync) {
  throw new Error('jest.mock is not correctly hooked up and memfs is not in use. Aborting for security reasons');
}

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
