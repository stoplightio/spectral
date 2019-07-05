import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('api-servers', () => {
  const s = new Spectral();
  s.addRules({
    'api-servers': Object.assign(ruleset.rules['api-servers'], {
      recommended: true,
      type: RuleType[ruleset.rules['api-servers'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      paths: {},
      servers: [{ url: 'https://stoplight.io' }],
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if servers is missing', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      paths: {},
    });
    expect(results).toEqual([
      {
        code: 'api-servers',
        message: 'OpenAPI `servers` must be present and non-empty array.',
        path: ['servers'],
        range: {
          end: {
            character: 13,
            line: 2,
          },
          start: {
            character: 0,
            line: 0,
          },
        },
        severity: DiagnosticSeverity.Warning,
        summary: 'OpenAPI `servers` must be present and non-empty array.',
      },
    ]);
  });

  test('return errors if servers is an empty array', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      paths: {},
      servers: [],
    });
    expect(results).toEqual([
      {
        code: 'api-servers',
        message: 'OpenAPI `servers` must be present and non-empty array.',
        path: ['servers'],
        range: {
          end: {
            character: 15,
            line: 3,
          },
          start: {
            character: 12,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Warning,
        summary: 'OpenAPI `servers` must be present and non-empty array.',
      },
    ]);
  });
});
