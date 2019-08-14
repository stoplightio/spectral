import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import * as fs from 'fs';
import * as nock from 'nock';
import * as path from 'path';
import { Spectral } from '../spectral';

const oasRuleset = require('../rulesets/oas/index.json');
const customOASRuleset = require('./__fixtures__/custom-oas-ruleset.json');

jest.mock('fs');

describe('Spectral', () => {
  let readFileSpy: jest.SpyInstance;
  let accessSpy: jest.SpyInstance;

  beforeAll(() => {
    const { readFile, access } = fs;
    readFileSpy = jest.spyOn(fs, 'readFile');
    accessSpy = jest.spyOn(fs, 'access');

    accessSpy.mockImplementation((target, type, cb) => {
      return access(target.replace('src/rulesets/oas', 'dist/rulesets/oas'), type, cb);
    });

    readFileSpy.mockImplementation((target, encoding, cb) => {
      return readFile(target.replace('src/rulesets/oas', 'dist/rulesets/oas'), encoding, cb);
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    readFileSpy.mockRestore();
    accessSpy.mockRestore();
  });

  describe('loadRuleset', () => {
    test('should support loading rulesets from filesystem', async () => {
      const s = new Spectral();
      await s.loadRuleset(path.join(__dirname, '__fixtures__/custom-oas-ruleset.json'));

      expect(s.rules).toEqual({
        ...[...Object.entries(oasRuleset.rules)].reduce<Dictionary<unknown>>((oasRules, [name, rule]) => {
          oasRules[name] = {
            name,
            ...rule,
            formats: expect.arrayContaining([expect.any(String)]),
            severity: expect.any(Number),
            then: expect.any(Object),
          };

          return oasRules;
        }, {}),
        'info-matches-stoplight': {
          ...customOASRuleset.rules['info-matches-stoplight'],
          name: 'info-matches-stoplight',
          severity: DiagnosticSeverity.Warning,
        },
      });
    });

    test('should support loading rulesets over http', async () => {
      const ruleset = {
        rules: {
          'info-matches-stoplight': {
            message: 'Info must contain Stoplight',
            given: '$.info',
            type: 'style',
            then: {
              field: 'title',
              function: 'pattern',
              functionOptions: {
                match: 'Stoplight',
              },
            },
          },
        },
      };

      nock('https://localhost:4000')
        .get('/custom-ruleset')
        .reply(200, JSON.stringify(ruleset));

      const s = new Spectral();
      await s.loadRuleset('https://localhost:4000/custom-ruleset');

      expect(s.rules).toEqual({
        'info-matches-stoplight': {
          ...ruleset.rules['info-matches-stoplight'],
          name: 'info-matches-stoplight',
          severity: DiagnosticSeverity.Warning,
        },
      });
    });
  });
});
