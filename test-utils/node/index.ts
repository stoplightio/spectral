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

export function serveAssets(mocks: Record<string, string | Record<string, unknown>>): void {
  for (const [uri, body] of Object.entries(mocks)) {
    if (!isURL(uri)) {
      fs.mkdirSync(dirname(uri), { recursive: true });
      fs.writeFileSync(uri, JSON.stringify(body));
      continue;
    }

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
        .reply(200, body);
    } else {
      scope.get(pathname).reply(200, body);
    }
  }
}
