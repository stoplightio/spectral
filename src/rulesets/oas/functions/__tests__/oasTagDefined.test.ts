import { RuleType, Spectral } from '../../../../index';

import { DiagnosticSeverity } from '@stoplight/types';
import { rules } from '../../index.json';
import oasTagDefined from '../oasTagDefined';

describe('oasTagDefined', () => {
  const s = new Spectral();
  s.registerFormat('oas2', () => true);
  s.setFunctions({ oasTagDefined });
  s.setRules({
    'operation-tag-defined': Object.assign(rules['operation-tag-defined'], {
      recommended: true,
      type: RuleType[rules['operation-tag-defined'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: 2.0,
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
      swagger: 2.0,
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
        range: {
          end: {
            character: 16,
            line: 11,
          },
          start: {
            character: 10,
            line: 11,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('return errors on undefined tags among defined tags', async () => {
    const results = await s.run({
      swagger: 2.0,
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
        range: {
          end: {
            character: 16,
            line: 15,
          },
          start: {
            character: 10,
            line: 15,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'operation-tag-defined',
        message: 'Operation tags should be defined in global tags.',
        path: ['paths', '/path1', 'get', 'tags', '3'],
        range: {
          end: {
            character: 16,
            line: 17,
          },
          start: {
            character: 10,
            line: 17,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('resilient to no global tags or operation tags', async () => {
    const results = await s.run({
      swagger: 2.0,
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
