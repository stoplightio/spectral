import * as yargs from 'yargs';

import { DiagnosticSeverity } from '@stoplight/types/dist';
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
  });

  it('shows help when no document argument is passed', async () => {
    const output = await run('lint');
    expect(output).toContain('document  Location of a JSON/YAML document');
  });

  it('shows help when invalid arguments are passed', async () => {
    const output = await run('lint --foo');
    expect(output).toContain('lint a JSON/YAML document from a file or URL');
  });

  it('calls lint with document and default options', async () => {
    const doc = './__fixtures__/empty-oas2-document.json';
    const ruleset = undefined;
    await run(`lint ${doc}`);
    expect(lint).toBeCalledWith(
      doc,
      {
        encoding: 'utf8',
        format: 'stylish',
      },
      ruleset,
    );
  });

  it('calls lint with document and custom encoding', async () => {
    const doc = './__fixtures__/empty-oas2-document.json';
    const ruleset = undefined;
    await run(`lint --encoding utf16 ${doc}`);
    expect(lint).toBeCalledWith(
      doc,
      {
        encoding: 'utf16',
        format: 'stylish',
      },
      ruleset,
    );
  });

  it('calls lint with document and custom encoding and format', async () => {
    const doc = './__fixtures__/empty-oas2-document.json';
    const ruleset = undefined;
    await run(`lint -f json --encoding utf16 ${doc}`);
    expect(lint).toBeCalledWith(
      doc,
      {
        encoding: 'utf16',
        format: 'json',
      },
      ruleset,
    );
  });

  it('calls lint with document and custom ruleset', async () => {
    const doc = './__fixtures__/empty-oas2-document.json';
    const ruleset = 'custom-ruleset.json';
    await run(`lint -r ${ruleset} ${doc}`);
    expect(lint).toBeCalledWith(doc, expect.any(Object), [ruleset]);
  });

  it('calls lint with document and multiple custom rulesets', async () => {
    const doc = './__fixtures__/empty-oas2-document.json';
    const ruleset = 'custom-ruleset.json';
    const ruleset2 = 'custom-ruleset-2.json';
    await run(`lint -r ${ruleset} -r ${ruleset2} ${doc}`);
    expect(lint).toBeCalledWith(doc, expect.any(Object), [ruleset, ruleset2]);
  });

  it.each(['json', 'stylish'])('calls formatOutput with %s format', async format => {
    await run(`lint -f ${format} ./__fixtures__/empty-oas2-document.json`);
    // needed by Node 8 (different ticking?) - can be simplified once we drop support for version 8
    await new Promise(resolve => {
      setImmediate(() => {
        expect(formatOutput).toBeCalledWith(results, format);
        resolve();
      });
    });
  });

  it('writes formatted output to a file', async () => {
    await run(`lint -o foo.json ./__fixtures__/empty-oas2-document.json`);
    // needed by Node 8 (different ticking?) - can be simplified once we drop support for version 8
    await new Promise(resolve => {
      setImmediate(() => {
        expect(writeOutput).toBeCalledWith('<formatted output>', 'foo.json');
        resolve();
      });
    });
  });

  it('passes skip-rule to lint', async () => {
    const ruleset = undefined;
    await run('lint --skip-rule foo --skip-rule bar ./__fixtures__/empty-oas2-document.json');
    expect(lint).toHaveBeenCalledWith(
      expect.any(String),
      {
        skipRule: ['foo', 'bar'],
        encoding: 'utf8',
        format: 'stylish',
      },
      ruleset,
    );
  });

  it('shows help if unknown format is passed', () => {
    return expect(run('lint -f foo ./__fixtures__/empty-oas2-document.json')).resolves.toContain(
      'lint a JSON/YAML document from a file or URL',
    );
  });

  it('errors upon exception', async () => {
    const error = new Error('Failure');
    (lint as jest.Mock).mockReset();
    (lint as jest.Mock).mockReturnValueOnce({
      // could be mockRejectedValueOnce, but Node 8 does not like it (different ticking?), so here is the workaround
      then() {
        return this;
      },
      catch(fn: Function) {
        fn(error);
        return this;
      },
    });

    await run(`lint -o foo.json ./__fixtures__/empty-oas2-document.json`);
    expect(errorSpy).toBeCalledWith(error);
  });
});
