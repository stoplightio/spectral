import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('oas3-server-trailing-slash', () => {
  const s = new Spectral();
  s.registerFormat('oas3', () => true);
  s.setRules({
    'oas3-server-trailing-slash': Object.assign(ruleset.rules['oas3-server-trailing-slash'], {
      recommended: true,
      type: RuleType[ruleset.rules['oas3-server-trailing-slash'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      paths: {},
      servers: [
        {
          url: 'https://stoplight.io',
        },
      ],
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if server url ends with a slash', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      paths: {},
      servers: [
        {
          url: 'https://stoplight.io/',
        },
      ],
    });
    expect(results).toEqual([
      {
        code: 'oas3-server-trailing-slash',
        message: 'Server URL should not have a trailing slash.',
        path: ['servers', '0', 'url'],
        resolvedPath: ['servers', '0', 'url'],
        range: {
          end: {
            character: 36,
            line: 5,
          },
          start: {
            character: 13,
            line: 5,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
