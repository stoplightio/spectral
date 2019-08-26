import { getLocationForJsonPath, parseWithPointers } from '@stoplight/json';
import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../../index';
import { rules as oas2Rules } from '../../../oas2/index.json';
import { rules as oas3Rules } from '../../../oas3/index.json';
import refSiblings from '../refSiblings';

describe('refSiblings', () => {
  describe('oas2', () => {
    const s = new Spectral();
    s.setFunctions({ refSiblings });
    s.setRules({
      '$ref-siblings': Object.assign(oas2Rules['$ref-siblings'], {
        recommended: true,
        type: RuleType[oas2Rules['$ref-siblings'].type],
      }),
    });

    test('does not report anything for valid object', async () => {
      const results = await s.run({
        swagger: '2.0',
        securityDefinitions: {
          apikey: {},
        },
        paths: {
          '/path': {
            get: {
              security: [
                {
                  apikey: [],
                },
              ],
            },
          },
        },
      });

      expect(results.length).toEqual(0);
    });

    test('reports $ref siblings', async () => {
      const doc = `{
  "swagger": "2.0",
  "securityDefinitions": {
    "apikey": {},
    "$ref": "#/securityDefinitions/apikey"
  },
  "paths": {
    "$ref": "#/securityDefinitions/apikey",
    "/path": {
      "post": {},
      "$ref": "#/foo/bar",
      "get": {
        "$ref": "#/da",
        "security": [
          {
            "apikey": []
          }
        ]
      }
    }
  }
}`;

      const results = await s.run({
        parsed: parseWithPointers(doc),
        getLocationForJsonPath,
      });

      expect(results).toEqual([
        {
          code: '$ref-siblings',
          message: 'Property cannot be placed among $ref',
          path: ['securityDefinitions', 'apikey'],
          range: {
            end: {
              character: 16,
              line: 3,
            },
            start: {
              character: 14,
              line: 3,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
        {
          code: '$ref-siblings',
          message: 'Property cannot be placed among $ref',
          path: ['paths', '/path'],
          range: {
            end: {
              character: 5,
              line: 19,
            },
            start: {
              character: 13,
              line: 8,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
        {
          code: '$ref-siblings',
          message: 'Property cannot be placed among $ref',
          path: ['paths', '/path', 'post'],
          range: {
            end: {
              character: 16,
              line: 9,
            },
            start: {
              character: 14,
              line: 9,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
        {
          code: '$ref-siblings',
          message: 'Property cannot be placed among $ref',
          path: ['paths', '/path', 'get'],
          range: {
            end: {
              character: 7,
              line: 18,
            },
            start: {
              character: 13,
              line: 11,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
        {
          code: '$ref-siblings',
          message: 'Property cannot be placed among $ref',
          path: ['paths', '/path', 'get', 'security'],
          range: {
            end: {
              character: 9,
              line: 17,
            },
            start: {
              character: 20,
              line: 13,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
      ]);
    });
  });

  describe('oas3', () => {
    const s = new Spectral();
    s.setFunctions({ refSiblings });
    s.setRules({
      '$ref-siblings': Object.assign(oas3Rules['$ref-siblings'], {
        recommended: true,
        type: RuleType[oas3Rules['$ref-siblings'].type],
      }),
    });

    test('does not report anything for valid object', async () => {
      const results = await s.run({
        openapi: '3.0.0',
        components: {
          securityDefinitions: {
            apikey: {},
          },
        },
        paths: {
          '/path': {
            get: {
              security: [
                {
                  apikey: [],
                },
              ],
            },
          },
        },
      });

      expect(results.length).toEqual(0);
    });

    test('reports $ref siblings', async () => {
      const doc = `{
  "openapi": "3.0.0",
  "components": {
    "securityDefinitions": {
      "apikey": {},
      "$ref": "#/components/securityDefinitions/apikey"
    }
  },
  "paths": {
    "$ref": "#/components/securityDefinitions/apikey",
    "/path": {
      "post": {},
      "$ref": "#/foo/bar",
      "get": {
        "$ref": "#/da",
        "security": [
          {
            "apikey": []
          }
        ]
      }
    }
  }
}`;

      const results = await s.run({
        parsed: parseWithPointers(doc),
        getLocationForJsonPath,
      });

      expect(results).toEqual([
        {
          code: '$ref-siblings',
          message: 'Property cannot be placed among $ref',
          path: ['components', 'securityDefinitions', 'apikey'],
          range: {
            end: {
              character: 18,
              line: 4,
            },
            start: {
              character: 16,
              line: 4,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
        {
          code: '$ref-siblings',
          message: 'Property cannot be placed among $ref',
          path: ['paths', '/path'],
          range: {
            end: {
              character: 5,
              line: 21,
            },
            start: {
              character: 13,
              line: 10,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
        {
          code: '$ref-siblings',
          message: 'Property cannot be placed among $ref',
          path: ['paths', '/path', 'post'],
          range: {
            end: {
              character: 16,
              line: 11,
            },
            start: {
              character: 14,
              line: 11,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
        {
          code: '$ref-siblings',
          message: 'Property cannot be placed among $ref',
          path: ['paths', '/path', 'get'],
          range: {
            end: {
              character: 7,
              line: 20,
            },
            start: {
              character: 13,
              line: 13,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
        {
          code: '$ref-siblings',
          message: 'Property cannot be placed among $ref',
          path: ['paths', '/path', 'get', 'security'],
          range: {
            end: {
              character: 9,
              line: 19,
            },
            start: {
              character: 20,
              line: 15,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
      ]);
    });
  });
});
