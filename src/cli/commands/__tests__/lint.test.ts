import * as yargs from 'yargs';

import { DiagnosticSeverity } from '@stoplight/types';
import { IRuleResult } from '../../../types';
import { lint } from '../../services/linter';
import { formatOutput, writeOutput } from '../../services/output';
import lintCommand from '../lint';

jest.mock('../../services/output');
jest.mock('../../services/linter');

function run(command: string) {
  const parser = yargs.command(lintCommand).help();
  return new Promise(done => {
    parser.parse(command, (err: Error, argv: unknown, output: string) => {
      done(output);
    });
  });
}

describe('lint', () => {
  let errorSpy: jest.SpyInstance;
  const { isTTY } = process.stdin;

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
    (lint as jest.Mock).mockClear();
    (lint as jest.Mock).mockResolvedValueOnce(results);

    (formatOutput as jest.Mock).mockClear();
    (formatOutput as jest.Mock).mockReturnValueOnce('<formatted output>');

    (writeOutput as jest.Mock).mockClear();
    (writeOutput as jest.Mock).mockResolvedValueOnce(undefined);

    errorSpy = jest.spyOn(console, 'error');
  });

  afterEach(() => {
    errorSpy.mockRestore();
    process.stdin.isTTY = isTTY;
  });

  it('shows help when no document and no STDIN are present', async () => {
    process.stdin.isTTY = true;
    const output = await run('lint');
    expect(output).toContain('documents  Location of JSON/YAML documents');
  });

  describe('when STDIN is present', () => {
    it('does not show help when documents are missing', async () => {
      const output = await run('lint');
      expect(output).not.toContain('documents  Location of JSON/YAML documents');
    });

    it('calls with lint with STDIN file descriptor', async () => {
      await run('lint');
      expect(lint).toBeCalledWith([0], {
        encoding: 'utf8',
        format: 'stylish',
        ignoreUnknownFormat: false,
        failOnUnmatchedGlobs: false,
      });
    });
  });

  it('shows help when invalid arguments are passed', async () => {
    const output = await run('lint --foo');
    expect(output).toContain('documents  Location of JSON/YAML documents. Can be either a file, a glob or');
  });

  it('calls lint with document and default options', async () => {
    const doc = './__fixtures__/empty-oas2-document.json';
    await run(`lint ${doc}`);
    expect(lint).toBeCalledWith([doc], {
      encoding: 'utf8',
      format: 'stylish',
      ignoreUnknownFormat: false,
      failOnUnmatchedGlobs: false,
    });
  });

  it('calls lint with document and custom encoding', async () => {
    const doc = './__fixtures__/empty-oas2-document.json';
    await run(`lint --encoding utf16 ${doc}`);
    expect(lint).toBeCalledWith([doc], {
      encoding: 'utf16',
      format: 'stylish',
      ignoreUnknownFormat: false,
      failOnUnmatchedGlobs: false,
    });
  });

  it('calls lint with document and custom encoding and format', async () => {
    const doc = './__fixtures__/empty-oas2-document.json';
    await run(`lint -f json --encoding utf16 ${doc}`);
    expect(lint).toBeCalledWith([doc], {
      encoding: 'utf16',
      format: 'json',
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
        ruleset: [ruleset],
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

  it('calls lint with document and paths', async () => {
    const doc = './__fixtures__/empty-oas2-document.json';
    const path = '/absolute/path/example';
    await run(`lint -p ${path} ${doc}`);
    expect(lint).toBeCalledWith(
      [doc],
      expect.objectContaining({
        paths: [path],
      }),
    );
  });

  it('calls lint with document and multiple paths', async () => {
    const doc = './__fixtures__/empty-oas2-document.json';
    const path1 = '/first/path';
    const path2 = '/second/path';
    await run(`lint --p ${path1} -p ${path2} ${doc}`);
    expect(lint).toBeCalledWith(
      [doc],
      expect.objectContaining({
        paths: [path1, path2],
      }),
    );
  });

  it.each(['json', 'stylish'])('calls formatOutput with %s format', async format => {
    await run(`lint -f ${format} ./__fixtures__/empty-oas2-document.json`);
    await new Promise(resolve => void process.nextTick(resolve));
    expect(formatOutput).toBeCalledWith(results, format, { failSeverity: DiagnosticSeverity.Error });
  });

  it('writes formatted output to a file', async () => {
    await run(`lint -o foo.json ./__fixtures__/empty-oas2-document.json`);
    await new Promise(resolve => void process.nextTick(resolve));
    expect(writeOutput).toBeCalledWith('<formatted output>', 'foo.json');
  });

  it('passes ignore-unknown-format to lint', async () => {
    await run('lint --ignore-unknown-format ./__fixtures__/empty-oas2-document.json');
    expect(lint).toHaveBeenCalledWith([expect.any(String)], {
      encoding: 'utf8',
      format: 'stylish',
      ignoreUnknownFormat: true,
      failOnUnmatchedGlobs: false,
    });
  });

  it('passes fail-on-unmatched-globs to lint', async () => {
    await run('lint --fail-on-unmatched-globs ./__fixtures__/empty-oas2-document.json');
    expect(lint).toHaveBeenCalledWith([expect.any(String)], {
      encoding: 'utf8',
      format: 'stylish',
      ignoreUnknownFormat: false,
      failOnUnmatchedGlobs: true,
    });
  });

  it('shows help if unknown format is passed', () => {
    return expect(run('lint -f foo ./__fixtures__/empty-oas2-document.json')).resolves.toContain(
      'documents  Location of JSON/YAML documents. Can be either a file, a glob or',
    );
  });

  it('prints error message upon exception', async () => {
    const error = new Error('Failure');
    (lint as jest.Mock).mockReset();
    (lint as jest.Mock).mockRejectedValueOnce(error);
    await run(`lint -o foo.json ./__fixtures__/empty-oas2-document.json`);
    await new Promise(resolve => void process.nextTick(resolve));
    expect(errorSpy).toBeCalledWith('Failure');
  });
});
