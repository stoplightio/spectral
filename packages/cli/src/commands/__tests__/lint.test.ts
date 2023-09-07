import * as yargs from 'yargs';
import { DiagnosticSeverity } from '@stoplight/types';
import { IRuleResult } from '@stoplight/spectral-core';
import * as process from 'process';
import { ErrorWithCause } from 'pony-cause';
import AggregateError from 'es-aggregate-error';

import { lint } from '../../services/linter';
import { formatOutput, writeOutput } from '../../services/output';
import lintCommand from '../lint';
import chalk from 'chalk';

jest.mock('process');
jest.mock('../../services/output');
jest.mock('../../services/linter');

function run(command: string) {
  const parser = yargs.command(lintCommand).help();
  return new Promise((resolve, reject) => {
    parser.parse(command, (err: Error, argv: unknown, output: string) => {
      if (err) {
        reject(`${err.message}\n${output}`);
      } else {
        resolve(output);
      }
    });
  });
}

describe('lint', () => {
  const results: IRuleResult[] = [
    {
      code: 'parser',
      message: 'Duplicate key: foo',
      path: ['foo'],
      range: {
        end: {
          character: 17,
          line: 0,
        },
        start: {
          character: 12,
          line: 0,
        },
      },
      severity: DiagnosticSeverity.Error,
    },
  ];

  beforeEach(() => {
    (lint as jest.Mock).mockResolvedValueOnce({ results: results, resolvedRuleset: {} });
    (formatOutput as jest.Mock).mockReturnValueOnce('<formatted output>');
    (writeOutput as jest.Mock).mockResolvedValueOnce(undefined);
  });

  afterEach(() => {
    process.stdin.isTTY = true;
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('shows help when no document and no STDIN are present', () => {
    return expect(run('lint')).rejects.toContain('documents  Location of JSON/YAML documents');
  });

  describe('when STDIN is present', () => {
    beforeEach(() => {
      process.stdin.isTTY = false;
    });

    it('does not show help when documents are missing', async () => {
      const output = await run('lint');
      expect(output).not.toContain('documents  Location of JSON/YAML documents');
    });

    it('calls with lint with STDIN file descriptor', async () => {
      await run('lint');
      expect(lint).toBeCalledWith([0], {
        encoding: 'utf8',
        format: ['stylish'],
        output: { stylish: '<stdout>' },
        ignoreUnknownFormat: false,
        failOnUnmatchedGlobs: false,
      });
    });
  });

  it('calls lint with document and default options', async () => {
    const doc = './__fixtures__/empty-oas2-document.json';
    await run(`lint ${doc}`);
    expect(lint).toBeCalledWith([doc], {
      encoding: 'utf8',
      format: ['stylish'],
      output: { stylish: '<stdout>' },
      ignoreUnknownFormat: false,
      failOnUnmatchedGlobs: false,
    });
  });

  it('calls lint with document and custom encoding', async () => {
    const doc = './__fixtures__/empty-oas2-document.json';
    await run(`lint --encoding ascii ${doc}`);
    expect(lint).toBeCalledWith([doc], {
      encoding: 'ascii',
      format: ['stylish'],
      output: { stylish: '<stdout>' },
      ignoreUnknownFormat: false,
      failOnUnmatchedGlobs: false,
    });
  });

  it('calls lint with document and custom encoding and format', async () => {
    const doc = './__fixtures__/empty-oas2-document.json';
    await run(`lint -f json --encoding ascii ${doc}`);
    expect(lint).toBeCalledWith([doc], {
      encoding: 'ascii',
      format: ['json'],
      output: { json: '<stdout>' },
      ignoreUnknownFormat: false,
      failOnUnmatchedGlobs: false,
    });
  });

  it('calls lint with document and custom ruleset', async () => {
    const doc = './__fixtures__/empty-oas2-document.json';
    const ruleset = 'custom-ruleset.json';
    await run(`lint -r ${ruleset} ${doc}`);
    expect(lint).toBeCalledWith(
      [doc],
      expect.objectContaining({
        ruleset,
      }),
    );
  });

  it('calls lint with document and multiple custom rulesets', async () => {
    const doc = './__fixtures__/empty-oas2-document.json';
    const ruleset = 'custom-ruleset.json';
    const ruleset2 = 'custom-ruleset-2.json';
    await run(`lint --r ${ruleset} -r ${ruleset2} ${doc}`);
    expect(lint).toBeCalledWith(
      [doc],
      expect.objectContaining({
        ruleset: [ruleset, ruleset2],
      }),
    );
  });

  it.each(['json', 'stylish'])('calls formatOutput with %s format', async format => {
    await run(`lint -f ${format} ./__fixtures__/empty-oas2-document.json`);
    expect(formatOutput).toBeCalledWith(results, format, { failSeverity: DiagnosticSeverity.Error }, expect.anything());
  });

  it('writes formatted output to a file', async () => {
    await run(`lint -o foo.json ./__fixtures__/empty-oas2-document.json`);
    expect(writeOutput).toBeCalledWith('<formatted output>', 'foo.json');
  });

  it('writes formatted output to multiple files when using format and output flags', async () => {
    (formatOutput as jest.Mock).mockReturnValue('<formatted output>');

    await run(
      `lint --format html --format json --output.json foo.json --output.html foo.html ./__fixtures__/empty-oas2-document.json`,
    );
    expect(writeOutput).toBeCalledTimes(2);
    expect(writeOutput).nthCalledWith(1, '<formatted output>', 'foo.html');
    expect(writeOutput).nthCalledWith(2, '<formatted output>', 'foo.json');
  });

  it('writes formatted output to multiple files and stdout when using format and output flags', async () => {
    (formatOutput as jest.Mock).mockReturnValue('<formatted output>');

    await run(`lint --format html --format json --output.json foo.json ./__fixtures__/empty-oas2-document.json`);
    expect(writeOutput).toBeCalledTimes(2);
    expect(writeOutput).nthCalledWith(1, '<formatted output>', '<stdout>');
    expect(writeOutput).nthCalledWith(2, '<formatted output>', 'foo.json');
  });

  it('passes ignore-unknown-format to lint', async () => {
    await run('lint --ignore-unknown-format ./__fixtures__/empty-oas2-document.json');
    expect(lint).toHaveBeenCalledWith([expect.any(String)], {
      encoding: 'utf8',
      format: ['stylish'],
      output: { stylish: '<stdout>' },
      ignoreUnknownFormat: true,
      failOnUnmatchedGlobs: false,
    });
  });

  it('passes fail-on-unmatched-globs to lint', async () => {
    await run('lint --fail-on-unmatched-globs ./__fixtures__/empty-oas2-document.json');
    expect(lint).toHaveBeenCalledWith([expect.any(String)], {
      encoding: 'utf8',
      format: ['stylish'],
      output: { stylish: '<stdout>' },
      ignoreUnknownFormat: false,
      failOnUnmatchedGlobs: true,
    });
  });

  it('shows help if unknown format is passed', () => {
    return expect(run('lint -f foo ./__fixtures__/empty-oas2-document.json')).rejects.toContain(
      'documents  Location of JSON/YAML documents. Can be either a file, a glob or',
    );
  });

  it('prints error message upon exception', async () => {
    const error = new Error('Failure');
    (lint as jest.Mock).mockReset();
    (lint as jest.Mock).mockRejectedValueOnce(error);
    await run(`lint ./__fixtures__/empty-oas2-document.json`);
    expect(process.stderr.write).nthCalledWith(1, chalk.red('Error running Spectral!\n'));
    expect(process.stderr.write).nthCalledWith(2, chalk.red('Use --verbose flag to print the error stack.\n'));
    expect(process.stderr.write).nthCalledWith(3, `Error #1: ${chalk.red('Failure')}\n`);
  });

  it('prints each error separately', async () => {
    (lint as jest.Mock).mockReset();
    (lint as jest.Mock).mockRejectedValueOnce(
      new AggregateError([
        new Error('some unhandled exception'),
        new TypeError('another one'),
        new ErrorWithCause('some error with cause', { cause: 'original exception' }),
      ]),
    );
    await run(`lint ./__fixtures__/empty-oas2-document.json`);
    expect(process.stderr.write).nthCalledWith(3, `Error #1: ${chalk.red('some unhandled exception')}\n`);
    expect(process.stderr.write).nthCalledWith(4, `Error #2: ${chalk.red('another one')}\n`);
    expect(process.stderr.write).nthCalledWith(5, `Error #3: ${chalk.red('original exception')}\n`);
  });

  it('given verbose flag, prints each error together with their stacks', async () => {
    (lint as jest.Mock).mockReset();
    (lint as jest.Mock).mockRejectedValueOnce(
      new AggregateError([
        new Error('some unhandled exception'),
        new TypeError('another one'),
        new ErrorWithCause('some error with cause', { cause: 'original exception' }),
      ]),
    );

    await run(`lint --verbose ./__fixtures__/empty-oas2-document.json`);

    expect(process.stderr.write).nthCalledWith(2, `Error #1: ${chalk.red('some unhandled exception')}\n`);
    expect(process.stderr.write).nthCalledWith(
      3,
      expect.stringContaining(`packages/cli/src/commands/__tests__/lint.test.ts:236`),
    );

    expect(process.stderr.write).nthCalledWith(4, `Error #2: ${chalk.red('another one')}\n`);
    expect(process.stderr.write).nthCalledWith(
      5,
      expect.stringContaining(`packages/cli/src/commands/__tests__/lint.test.ts:237`),
    );

    expect(process.stderr.write).nthCalledWith(6, `Error #3: ${chalk.red('original exception')}\n`);
  });
});
