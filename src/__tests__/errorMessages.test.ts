import { cloneDeep } from 'lodash';
import { formatParserDiagnostics } from '../errorMessages';

describe('Error messages', () => {
  describe('parser diagnostics', () => {
    it('prettifies JSON diagnostics', () => {
      const diagnostics = [
        {
          range: {
            start: {
              line: 0,
              character: 12,
            },
            end: {
              line: 0,
              character: 17,
            },
          },
          path: ['test'],
          message: 'DuplicateKey',
          severity: 0,
          code: 20,
        },
        {
          range: {
            start: {
              line: 0,
              character: 24,
            },
            end: {
              line: 0,
              character: 25,
            },
          },
          message: 'PropertyNameExpected',
          severity: 0,
          code: 3,
        },
        {
          range: {
            start: {
              line: 0,
              character: 24,
            },
            end: {
              line: 0,
              character: 25,
            },
          },
          message: 'ValueExpected',
          severity: 0,
          code: 4,
        },
        {
          range: {
            start: {
              line: 0,
              character: 27,
            },
            end: {
              line: 0,
              character: 28,
            },
          },
          message: 'EndOfFileExpected',
          severity: 0,
          code: 9,
        },
      ];

      expect(formatParserDiagnostics(cloneDeep(diagnostics), null)).toEqual([
        {
          ...diagnostics[0],
          path: ['test'],
          resolvedPath: ['test'],
          message: 'Duplicate key: test',
          code: 'parser',
        },
        {
          ...diagnostics[1],
          path: [],
          resolvedPath: [],
          message: 'Property name expected',
          code: 'parser',
        },
        {
          ...diagnostics[2],
          path: [],
          resolvedPath: [],
          message: 'Value expected',
          code: 'parser',
        },
        {
          ...diagnostics[3],
          path: [],
          resolvedPath: [],
          message: 'End of file expected',
          code: 'parser',
        },
      ]);
    });

    it('prettifies YAML diagnostics', () => {
      const diagnostics = [
        {
          code: 'YAMLException',
          message: 'expected a single document in the stream, but found more',
          severity: 0,
          range: {
            start: {
              line: 0,
              character: 0,
            },
            end: {
              line: 0,
              character: 0,
            },
          },
        },
        {
          code: 'YAMLException',
          message: 'end of the stream or a document separator is expected',
          severity: 0,
          range: {
            start: {
              line: 1,
              character: 5,
            },
            end: {
              line: 1,
              character: 5,
            },
          },
        },
        {
          code: 'YAMLException',
          message: 'unknown tag <tag:yaml.org,2002:2>',
          severity: 0,
          range: {
            start: {
              line: 2,
              character: 3,
            },
            end: {
              line: 2,
              character: 6,
            },
          },
        },
      ];

      expect(formatParserDiagnostics(cloneDeep(diagnostics), null)).toEqual([
        {
          ...diagnostics[0],
          path: [],
          resolvedPath: [],
          message: 'Expected a single document in the stream, but found more',
          code: 'parser',
        },
        {
          ...diagnostics[1],
          path: [],
          resolvedPath: [],
          message: 'End of the stream or a document separator is expected',
          code: 'parser',
        },
        {
          ...diagnostics[2],
          path: [],
          resolvedPath: [],
          message: 'Unknown tag <tag:yaml.org,2002:2>',
          code: 'parser',
        },
      ]);
    });
  });
});
