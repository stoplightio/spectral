import * as fs from 'fs';
import { serveAssets } from '@stoplight/spectral-test-utils';
import { fetch } from '@stoplight/spectral-runtime';

jest.mock?.('fs');

import { BundleOptions, bundleRuleset } from '../../index';
import type { IO } from '../../types';
import { virtualFs } from '../virtualFs';
import { skypack } from '../skypack';

describe('Skypack Plugin', () => {
  let io: IO;

  beforeEach(() => {
    io = {
      fs,
      fetch,
    };
  });

  describe.each<BundleOptions['target']>(['browser'])('given %s target', target => {
    it('should map valid npm packages', async () => {
      serveAssets({
        '/tmp/input.js': `import upperCase from 'lodash';
import { fetch } from './common/fetch.mjs';
import AggregateError from './common/error.mjs';

fetch(uri)
  .then(res => res.text())
  .then(res => upperCase(res))
  .catch(() => new AggregateError([]));`,
        '/tmp/common/fetch.mjs': `export { default as fetch } from 'isomorphic-fetch'`,
        '/tmp/common/error.mjs': `import shim from 'aggregate-error/polyfill';
shim();

export default AggregateError;
`,
      });

      const code = await bundleRuleset('/tmp/input.js', {
        target,
        plugins: [skypack(), virtualFs(io)],
      });

      expect(code).toEqual(`import upperCase from 'https://cdn.skypack.dev/lodash';
import fetch from 'https://cdn.skypack.dev/isomorphic-fetch';
import shim from 'https://cdn.skypack.dev/aggregate-error/polyfill';

shim();

var AggregateError$1 = AggregateError;

fetch(uri)
  .then(res => res.text())
  .then(res => upperCase(res))
  .catch(() => new AggregateError$1([]));
`);
    });

    it('should support package exports', async () => {
      serveAssets({
        '/tmp/input.js': `import hooks from 'preact/hooks';
export default hooks.useTimeout;`,
      });

      const code = await bundleRuleset('/tmp/input.js', {
        target,
        plugins: [skypack(), virtualFs(io)],
      });

      expect(code).toEqual(`import hooks from 'https://cdn.skypack.dev/preact/hooks';

var input = hooks.useTimeout;

export { input as default };
`);
    });

    it('should not touch data uris', async () => {
      serveAssets({
        '/tmp/input.js': `import upperCase from 'node:lodash';
import assert from 'file://home/assert.js';

assert.ok(upperCase('bar'));`,
      });

      const code = await bundleRuleset('/tmp/input.js', {
        target,
        plugins: [skypack(), virtualFs(io)],
      });

      expect(code).toEqual(`import upperCase from 'node:lodash';
import assert from 'file://home/assert.js';

assert.ok(upperCase('bar'));
`);
    });

    it('should not touch builtins', async () => {
      serveAssets({
        '/tmp/input.js': `import * as fs from 'fs';
import * as path from 'path';

fs.writeFileSync(path.join(__dirname, './output.js'), 'export default {}');`,
      });

      const code = await bundleRuleset('/tmp/input.js', {
        target,
        plugins: [skypack(), virtualFs(io)],
      });

      expect(code).toEqual(`import * as fs from 'fs';
import * as path from 'path';

fs.writeFileSync(path.join(__dirname, './output.js'), 'export default {}');
`);
    });
  });
});
