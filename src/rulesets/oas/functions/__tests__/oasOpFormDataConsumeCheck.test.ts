import { DiagnosticSeverity } from '@stoplight/types';
import { Spectral } from '../../../../index';
import { createWithRules } from '../../../__tests__/__helpers__/tester';

// todo: move to oas2-operation-formData-consume-check
describe('oasOpFormDataConsumeCheck', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['oas2-operation-formData-consume-check']);
  });

  it('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/path1': {
          get: {
            consumes: ['application/x-www-form-urlencoded', 'application/xml'],
            parameters: [{ in: 'formData', name: 'test' }],
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  it('return errors on different path operations same id', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/path1': {
          get: {
            consumes: ['application/xml'],
            parameters: [{ in: 'formData', name: 'test' }],
          },
        },
      },
    });

    expect(results).toEqual([
      {
        code: 'oas2-operation-formData-consume-check',
        message:
          'Operations with an `in: formData` parameter must include `application/x-www-form-urlencoded` or `multipart/form-data` in their `consumes` property.',
        path: ['paths', '/path1', 'get'],
        range: {
          end: {
            character: 26,
            line: 11,
          },
          start: {
            character: 12,
            line: 4,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
