import * as fs from 'fs';
import { serveAssets } from '@stoplight/spectral-test-utils';
import { fetch } from '@stoplight/spectral-runtime';

jest.mock?.('fs');

import { bundleRuleset } from '../../index';
import { virtualFs } from '../virtualFs';
import type { IO } from '../../types';

describe('VirtualFs Plugin', () => {
  let io: IO;

  beforeEach(() => {
    io = {
      fs,
      fetch,
    };
  });

  it('should handle relative paths', async () => {
    serveAssets({
      '/p/spectral.js': `import upperCase from './fns/upperCase.js';
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

      '/p/shared/casing.mjs': `export function upperCase() { return null; }`,
      '/p/fns/upperCase.js': `import { upperCase } from '../shared/casing.mjs';
export default (targetVal) => {
  if (_.upperCase(targetVal) !== targetVal) {
    return [{ message: \`\${printValue(targetVal)} is not upper case!\` }];
  }
};`,
    });

    const code = await bundleRuleset('/p/spectral.js', {
      target: 'node',
      plugins: [virtualFs(io)],
    });

    expect(code).toEqual(`function upperCase$1() { return null; }

var upperCase = (targetVal) => {
  if (_.upperCase(targetVal) !== targetVal) {
    return [{ message: \`\${printValue(targetVal)} is not upper case!\` }];
  }
};

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

  it('should handle file: protocol', async () => {
    serveAssets({
      '/p/.spectral/my-fn.mjs': `import {isOdd} from './helpers/index.mjs';

export default (input) => {
  if (!isOdd(input)) {
    return [{ message: 'must be odd' }];
  }
};`,

      '/p/.spectral/helpers/index.mjs': `export * from './is-odd.mjs';`,
      '/p/.spectral/helpers/is-odd.mjs': `export const isOdd = (value) => value % 2 === 1`,

      '/p/spectral.mjs': `import myFn from 'file:///p/.spectral/my-fn.mjs';

export default {
  extends: [oas],
  rules: {
    'my-rule': {
       given: '$',
       then: { function: myFn },
    },
  },
};`,
    });

    const code = await bundleRuleset('/p/spectral.mjs', {
      target: 'browser',
      plugins: [virtualFs(io)],
    });

    expect(code).toEqual(`const isOdd = (value) => value % 2 === 1;

var myFn = (input) => {
  if (!isOdd(input)) {
    return [{ message: 'must be odd' }];
  }
};

var spectral = {
  extends: [oas],
  rules: {
    'my-rule': {
       given: '$',
       then: { function: myFn },
    },
  },
};

export { spectral as default };
`);
  });
});
