import * as fs from 'fs';
import { serveAssets, mockResponses } from '@stoplight/spectral-test-utils';
import { fetch } from '@stoplight/spectral-runtime';

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
      '/p/spectral.js': `import upperCase from 'https://esm.sh/lodash';
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

      'https://esm.sh/lodash': `export * from '/-/lodash.uppercase@v4.3.0-Ghj8UDzvgbRFVHwnUM53/dist=es2020,mode=imports/optimized/lodash.uppercase.js';
export {default} from '/-/lodash.uppercase@v4.3.0-Ghj8UDzvgbRFVHwnUM53/dist=es2020,mode=imports/optimized/lodash.uppercase.js';`,
      'https://esm.sh/-/lodash.uppercase@v4.3.0-Ghj8UDzvgbRFVHwnUM53/dist=es2020,mode=imports/optimized/lodash.uppercase.js': `export default function upperCase() {}`,
    });

    const code = await bundleRuleset('/p/spectral.js', {
      target: 'node',
      plugins: [url(io), virtualFs(io)],
    });

    expect(code).toEqual(`function upperCase() {}

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
      '/p/spectral.js': `import upperCase from 'https://esm.sh/lodash';
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
      'https://esm.sh/lodash': {
        404: 'not found',
      },
    });

    await expect(
      bundleRuleset('/p/spectral.js', {
        target: 'node',
        plugins: [url(io), virtualFs(io)],
      }),
    ).rejects.toThrowError(/Could not load https:\/\/esm\.sh\/lodash/);

  });
});
