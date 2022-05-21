import { DiagnosticSeverity } from '@stoplight/types';
import * as fs from 'fs';
import * as process from 'process';
import * as formatters from '../../formatters';
import { OutputFormat } from '../config';
import { formatOutput, writeOutput } from '../output';

jest.mock('../../formatters');
jest.mock('fs', () => ({
  readFileSync: jest.requireActual('fs').readFileSync,
  promises: {
    writeFile: jest.fn().mockResolvedValue(void 0),
  },
}));
jest.mock('process');

describe('Output service', () => {
  describe('formatOutput', () => {
    it.each(['stylish', 'json', 'junit'])('calls %s formatter with given result', format => {
      const results = [
        {
          code: 'info-contact',
          path: ['info'],
          message: 'Info object should contain `contact` object.',
          severity: DiagnosticSeverity.Information,
          range: {
            start: {
              line: 2,
              character: 9,
            },
            end: {
              line: 6,
              character: 19,
            },
          },
          source: '/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3.json',
        },
      ];

      const output = `value for ${format}`;
      (formatters[format] as jest.Mock).mockReturnValueOnce(output);
      expect(formatOutput(results, format as OutputFormat, { failSeverity: DiagnosticSeverity.Error })).toEqual(output);
    });
  });

  describe('writeOutput', () => {
    it('given outputFile, writes output to a specified path', async () => {
      const output = '{}';
      const outputFile = 'foo.json';
      expect(await writeOutput(output, outputFile)).toBeUndefined();
      expect(fs.promises.writeFile).toBeCalledWith(outputFile, output);
    });

    it('given <stdout>, print output to console', async () => {
      const output = '{}';
      expect(await writeOutput(output, '<stdout>')).toBeUndefined();
      expect(process.stdout.write).toBeCalledWith(output);
    });
  });
});
