import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { loadRules } from './__helpers__/loadRules';

describe('oas3-server-trailing-slash', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await loadRules(['oas3-server-trailing-slash']);
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

  test('validate a correct object with default value', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      paths: {},
      servers: [
        {
          url: '/',
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
