import { RuleType, Spectral } from '../../../../index';

import { DiagnosticSeverity } from '@stoplight/types';
import { rules } from '../../index.json';
import oasTagDefined from '../oasTagDefined';

describe('oasTagDefined', () => {
  let s: Spectral;

  beforeEach(() => {
    s = new Spectral();
    s.setFunctions({ oasTagDefined });
    s.setRules({
      'operation-tag-defined': Object.assign(rules['operation-tag-defined'], {
        recommended: true,
        type: RuleType[rules['operation-tag-defined'].type],
      }),
    });
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      tags: [
        {
          name: 'tag1',
        },
        {
          name: 'tag2',
        },
      ],
      paths: {
        '/path1': {
          get: {
            tags: ['tag1'],
          },
        },
        '/path2': {
          get: {
            tags: ['tag2'],
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors on undefined tag', async () => {
    const results = await s.run({
      tags: [
        {
          name: 'tag1',
        },
      ],
      paths: {
        '/path1': {
          get: {
            tags: ['tag2'],
          },
        },
      },
    });

    expect(results).toEqual([
      {
        code: 'operation-tag-defined',
        message: 'Operation tags should be defined in global tags.',
        path: ['paths', '/path1', 'get', 'tags', '0'],
        resolvedPath: ['paths', '/path1', 'get', 'tags', '0'],
        range: {
          end: {
            character: 16,
            line: 10,
          },
          start: {
            character: 10,
            line: 10,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('return errors on undefined tags among defined tags', async () => {
    const results = await s.run({
      tags: [
        {
          name: 'tag1',
        },
        {
          name: 'tag3',
        },
      ],
      paths: {
        '/path1': {
          get: {
            tags: ['tag1', 'tag2', 'tag3', 'tag4'],
          },
        },
      },
    });

    expect(results).toEqual([
      {
        code: 'operation-tag-defined',
        message: 'Operation tags should be defined in global tags.',
        path: ['paths', '/path1', 'get', 'tags', '1'],
        resolvedPath: ['paths', '/path1', 'get', 'tags', '1'],
        range: {
          end: {
            character: 16,
            line: 14,
          },
          start: {
            character: 10,
            line: 14,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'operation-tag-defined',
        message: 'Operation tags should be defined in global tags.',
        path: ['paths', '/path1', 'get', 'tags', '3'],
        resolvedPath: ['paths', '/path1', 'get', 'tags', '3'],
        range: {
          end: {
            character: 16,
            line: 16,
          },
          start: {
            character: 10,
            line: 16,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('resilient to no global tags or operation tags', async () => {
    const results = await s.run({
      paths: {
        '/path1': {
          get: {
            operationId: 'id1',
          },
        },
        '/path2': {
          get: {
            operationId: 'id2',
          },
        },
      },
    });

    expect(results.length).toEqual(0);
  });
});
