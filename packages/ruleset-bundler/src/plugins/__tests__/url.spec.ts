import * as fs from 'fs';
import { serveAssets, mockResponses } from '@stoplight/spectral-test-utils';
import { fetch } from '@stoplight/spectral-runtime';

jest.mock?.('fs');

import { bundleRuleset } from '../../index';
import { virtualFs } from '../virtualFs';
import type { IO } from '../../types';
import { url } from '../url';

describe('Url Plugin', () => {
  let io: IO;

  beforeEach(() => {
    io = {
      fs,
      fetch,
    };
  });

  it('should handle absolute imports/exports', async () => {
    serveAssets({
      '/p/spectral.js': `import {upperCase} from 'https://cdn.skypack.dev/lodash';
export default {
  rules: {
    'upper-case': {
      given: '$.info',
      then: {
        function: upperCase,
      },
    },
  },
};`,

      'https://cdn.skypack.dev/lodash': `/*
 * Skypack CDN - lodash@4.17.21
 *
 * Learn more:
 *   📙 Package Documentation: https://www.skypack.dev/view/lodash
 *   📘 Skypack Documentation: https://www.skypack.dev/docs
 *
 * Pinned URL: (Optimized for Production)
 *   ▶️ Normal: https://cdn.skypack.dev/pin/lodash@v4.17.21-K6GEbP02mWFnLA45zAmi/mode=imports/optimized/lodash.js
 *   ⏩ Minified: https://cdn.skypack.dev/pin/lodash@v4.17.21-K6GEbP02mWFnLA45zAmi/mode=imports,min/optimized/lodash.js
 *
 */

// Browser-Optimized Imports (Don't directly import the URLs below in your application!)
export * from '/-/lodash@v4.17.21-K6GEbP02mWFnLA45zAmi/dist=es2020,mode=imports/optimized/lodash.js';
export {default} from '/-/lodash@v4.17.21-K6GEbP02mWFnLA45zAmi/dist=es2020,mode=imports/optimized/lodash.js';`,
      'https://cdn.skypack.dev/-/lodash@v4.17.21-K6GEbP02mWFnLA45zAmi/dist=es2020,mode=imports/optimized/lodash.js': `export function upperCase() {}

export default {};`,
    });

    const code = await bundleRuleset('/p/spectral.js', {
      target: 'node',
      plugins: [url(io), virtualFs(io)],
    });

    expect(code).toEqual(`function upperCase() {}

var lodash = {};

/*
 * Skypack CDN - lodash@4.17.21
 *
 * Learn more:
 *   📙 Package Documentation: https://www.skypack.dev/view/lodash
 *   📘 Skypack Documentation: https://www.skypack.dev/docs
 *
 * Pinned URL: (Optimized for Production)
 *   ▶️ Normal: https://cdn.skypack.dev/pin/lodash@v4.17.21-K6GEbP02mWFnLA45zAmi/mode=imports/optimized/lodash.js
 *   ⏩ Minified: https://cdn.skypack.dev/pin/lodash@v4.17.21-K6GEbP02mWFnLA45zAmi/mode=imports,min/optimized/lodash.js
 *
 */

var spectral = {
  rules: {
    'upper-case': {
      given: '$.info',
      then: {
        function: upperCase,
      },
    },
  },
};

export { spectral as default };
`);
  });

  it('should handle relative imports/exports', async () => {
    serveAssets({
      '/tmp/input.js': `import {isPlainObject} from 'https://stoplight.io/package/@stoplight/json/isPlainObject.mjs';

export { isPlainObject };
`,

      'https://stoplight.io/package/@stoplight/json/isPlainObject.mjs': `import toString from './toString.mjs';
export function isPlainObject(input) {
   return toString(input) === '[object Object]';
}`,

      'https://stoplight.io/package/@stoplight/json/toString.mjs': `export default (input) => ({}).toString.call(input)`,
    });

    const code = await bundleRuleset('/tmp/input.js', {
      target: 'node',
      plugins: [url(io), virtualFs(io)],
    });

    expect(code).toEqual(`var toString = (input) => ({}).toString.call(input);

function isPlainObject(input) {
   return toString(input) === '[object Object]';
}

export { isPlainObject };
`);
  });

  it('should handle network errors', async () => {
    serveAssets({
      '/p/spectral.js': `import {upperCase} from 'https://cdn.skypack.dev/lodash';
export default {
  rules: {
    'upper-case': {
      given: '$.info',
      then: {
        function: upperCase,
      },
    },
  },
};`,
    });

    mockResponses({
      'https://cdn.skypack.dev/lodash': {
        404: 'not found',
      },
    });

    await expect(
      bundleRuleset('/p/spectral.js', {
        target: 'node',
        plugins: [url(io), virtualFs(io)],
      }),
    ).rejects.toThrowError(/Could not load https:\/\/cdn.skypack.dev\/lodash/);
  });
});
