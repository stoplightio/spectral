import { Command, flags as flagHelpers } from '@oclif/command';
import { isAbsolute, resolve } from '@stoplight/path';
import { IParserResult, Optional } from '@stoplight/types';
import { getLocationForJsonPath, parseWithPointers } from '@stoplight/yaml';
import { writeFile } from 'fs';
import { isNil, omitBy } from 'lodash';
import { promisify } from 'util';

import { IRuleResult, RunRuleCollection } from '../..';
import { json, stylish } from '../../formatters';
import { readParsable } from '../../fs/reader';
import { httpAndFileResolver } from '../../resolvers/http-and-file';
import { getDefaultRulesetFile } from '../../rulesets/loader';
import { isOpenApiv2, isOpenApiv3 } from '../../rulesets/lookups';
import { Spectral } from '../../spectral';
import { IParsedResult } from '../../types';
import { ILintConfig, OutputFormat } from '../../types/config';

const writeFileAsync = promisify(writeFile);
export default class Lint extends Command {
  public static description = 'lint a JSON/YAML document from a file or URL';

  public static examples = [
    `$ spectral lint .openapi.yaml
linting ./openapi.yaml
`,
  ];

  private static defaultLintConfig: ILintConfig = {
    encoding: 'utf8',
    format: OutputFormat.STYLISH,
    verbose: false,
  };

  public static flags = {
    help: flagHelpers.help({ char: 'h' }),
    encoding: flagHelpers.string({
      char: 'e',
      description: 'text encoding to use',
    }),
    format: flagHelpers.string({
      char: 'f',
      description: 'formatter to use for outputting results',
      options: ['json', 'stylish'],
    }),
    output: flagHelpers.string({
      char: 'o',
      description: 'output to a file instead of stdout',
    }),
    ruleset: flagHelpers.string({
      char: 'r',
      description: 'path to a ruleset file (supports remote files)',
      multiple: true,
    }),
    'skip-rule': flagHelpers.string({
      char: 's',
      description: 'ignore certain rules if they are causing trouble',
      multiple: true,
    }),
    verbose: flagHelpers.boolean({
      char: 'v',
      description: 'increase verbosity',
    }),
    quiet: flagHelpers.boolean({
      char: 'q',
      description: 'no logging - output only',
    }),
  };

  protected quiet = false;

  public static args = [{ name: 'source' }];

  public async run() {
    const { args, flags } = this.parse(Lint);
    const { ruleset } = flags;
    let rulesets: string[] | undefined;

    const cwd = process.cwd();

    const lintConfig: ILintConfig = mergeConfig({ ...Lint.defaultLintConfig }, flags as Partial<ILintConfig>);

    this.quiet = flags.quiet;

    const rulesetFile = ruleset || (await getDefaultRulesetFile(cwd));

    if (rulesetFile) {
      try {
        rulesets = (Array.isArray(rulesetFile) ? rulesetFile : [rulesetFile]).map(
          file => (isAbsolute(file) ? file : resolve(cwd, file)),
        );
      } catch (ex) {
        this.log(ex.message);
        this.error(ex);
      }
    }

    if (args.source) {
      try {
        await lint(isAbsolute(args.source) ? args.source : resolve(cwd, args.source), lintConfig, this, rulesets);
      } catch (ex) {
        this.error(ex.message);
      }
    } else {
      this.error('You must specify a document to lint');
    }
  }

  public log(message?: string, ...args: any[]): void {
    if (!this.quiet) {
      super.log(message, ...args);
    }
  }

  public print(message?: string, ...args: any[]): void {
    super.log(message, ...args);
  }
}

async function lint(name: string, flags: ILintConfig, command: Lint, rulesets: Optional<string[] | string>) {
  const spectral = new Spectral({ resolver: httpAndFileResolver });

  try {
    await spectral.loadRuleset(rulesets || ['spectral:oas']);
  } catch (ex) {
    command.log(ex.message);
    process.exitCode = 2;
    throw ex;
  }

  if (flags.verbose) {
    command.log(`Linting ${name}`);
  }

  let targetUri = name;
  if (!/^https?:\/\//.test(name)) {
    // we always want the absolute path to the target file
    targetUri = resolve(name);
  }

  const spec: IParserResult = parseWithPointers(await readParsable(targetUri, flags.encoding), {
    ignoreDuplicateKeys: false,
    mergeKeys: true,
  });
  spectral.registerFormat('oas2', document => {
    if (isOpenApiv2(document)) {
      command.log('OpenAPI 2.0 (Swagger) detected');
      return true;
    }

    return false;
  });

  spectral.registerFormat('oas3', document => {
    if (isOpenApiv3(document)) {
      command.log('OpenAPI 3.x detected');
      return true;
    }

    return false;
  });

  if (rulesets && flags.verbose) {
    command.log(`Found ${Object.keys(rulesets).length} rulesets`);
  }

  if (flags.skipRule) {
    skipRules(spectral.rules, flags, command);
  }

  let results = [];
  try {
    const parsedResult: IParsedResult = {
      source: targetUri,
      parsed: spec,
      getLocationForJsonPath,
    };

    results = await spectral.run(parsedResult, {
      resolve: {
        documentUri: targetUri,
      },
    });

    if (results.length === 0) {
      command.log('No errors or warnings found!');
      return;
    }
  } catch (ex) {
    process.exitCode = 2;
    throw new Error(ex);
  }

  const output = await formatOutput(results, flags);
  try {
    await writeOutput(output, flags, command);
    process.exitCode = 1;
  } catch (ex) {
    process.exitCode = 2;
    throw new Error(ex);
  }
}

const skipRules = (rules: RunRuleCollection, flags: ILintConfig, command: Lint): RunRuleCollection => {
  const skippedRules: string[] = [];
  const invalidRules: string[] = [];

  if (flags.skipRule !== undefined) {
    for (const rule of flags.skipRule) {
      if (rule in rules) {
        delete rules[rule];
        skippedRules.push(rule);
      } else {
        invalidRules.push(rule);
      }
    }
  }

  if (invalidRules.length !== 0) {
    command.warn(`ignoring invalid ${invalidRules.length > 1 ? 'rules' : 'rule'} "${invalidRules.join(', ')}"`);
  }

  if (skippedRules.length !== 0 && flags.verbose) {
    command.log(`INFO: skipping ${skippedRules.length > 1 ? 'rules' : 'rule'} "${skippedRules.join(', ')}"`);
  }

  return rules;
};

async function formatOutput(results: IRuleResult[], flags: ILintConfig): Promise<string> {
  return {
    json: () => json(results),
    stylish: () => stylish(results),
  }[flags.format]();
}

export async function writeOutput(outputStr: string, flags: ILintConfig, command: Lint) {
  if (flags.output) {
    return writeFileAsync(flags.output, outputStr);
  }

  command.print(outputStr);
}

function mergeConfig(config: ILintConfig, flags: Partial<ILintConfig>): ILintConfig {
  return {
    ...config,
    ...omitBy<Partial<ILintConfig>>(
      {
        encoding: flags.encoding,
        format: flags.format,
        output: flags.output,
        verbose: flags.verbose,
        ruleset: flags.ruleset,
        quiet: flags.quiet,
        skipRule: flags['skip-rule'],
      },
      isNil,
    ),
  };
}
