import { Command, flags as flagHelpers } from '@oclif/command';
import { IParserResult } from '@stoplight/types';
import { getLocationForJsonPath, parseWithPointers } from '@stoplight/yaml';
import { existsSync, readFileSync, writeFile } from 'fs';
import { isNil, merge, omitBy } from 'lodash';
import { resolve } from 'path';
import { promisify } from 'util';
import { createEmptyConfig, getDefaultConfigFile, load as loadConfig } from '../../config/configLoader';

// @ts-ignore
import * as fetch from 'node-fetch';

import { json, stylish } from '../../formatters';
import { oas2Functions, oas2Rules } from '../../rulesets/oas2';
import { oas3Functions, oas3Rules } from '../../rulesets/oas3';
import { Spectral } from '../../spectral';
import { IParsedResult, IRuleResult } from '../../types';
import { IConfig } from '../../types/config';

const writeFileAsync = promisify(writeFile);

export default class Lint extends Command {
  public static description = 'lint a JSON/YAML document from a file or URL';

  public static examples = [
    `$ spectral lint .openapi.yaml
linting ./openapi.yaml
`,
  ];

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
    maxResults: flagHelpers.integer({
      char: 'm',
      description: '[default: all] maximum results to show',
    }),
    verbose: flagHelpers.boolean({
      char: 'v',
      description: 'increase verbosity',
    }),
    config: flagHelpers.string({
      char: 'c',
      description: 'path to a config file',
    }),
  };

  public static args = [{ name: 'source' }];

  public async run() {
    const { args, flags } = this.parse(Lint);
    const { config: configFileFlag } = flags;
    let config: IConfig = mergeConfig(createEmptyConfig(), flags);

    const configFile = configFileFlag || getDefaultConfigFile(process.cwd()) || null;
    if (configFile) {
      try {
        const loadedConfig = await loadConfig(configFile);
        config = mergeConfig(loadedConfig, flags);
      } catch (ex) {
        this.error('Cannot load provided config file');
      }
    }

    if (args.source) {
      try {
        await lint(args.source, config, this);
      } catch (ex) {
        this.error(ex.message);
      }
    } else {
      this.error('You must specify a document to lint');
    }
  }
}

async function lint(name: string, flags: any, command: Lint) {
  command.log(`linting ${name}`);
  let obj: IParserResult;
  try {
    obj = await readInputArguments(name, flags.encoding);
  } catch (ex) {
    throw new Error(`Could not parse ${name}: ${ex.message}`);
  }

  const spectral = new Spectral();
  if (obj.data.swagger && obj.data.swagger === '2.0') {
    command.log('OpenAPI 2.0 (Swagger) detected');
    spectral.addFunctions(oas2Functions());
    spectral.addRules(oas2Rules());
  } else if (obj.data.openapi && typeof obj.data.openapi === 'string' && obj.data.openapi.startsWith('3.')) {
    command.log('OpenAPI 3.x detected');
    spectral.addFunctions(oas3Functions());
    spectral.addRules(oas3Rules());
  } else {
    throw new Error('Input document specification type could not be determined');
  }

  let results = [];
  try {
    const parsedResult: IParsedResult = {
      source: resolve(process.cwd(), name),
      parsed: obj,
      getLocationForJsonPath,
    };

    results = await spectral.run(parsedResult);
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

async function formatOutput(results: IRuleResult[], flags: any): Promise<string> {
  if (flags.maxResults) {
    results = results.slice(0, flags.maxResults);
  }
  return {
    json: () => json(results),
    stylish: () => stylish(results),
  }[flags.format]();
}

async function writeOutput(outputStr: string, flags: any, command: Lint) {
  if (flags.output) {
    return writeFileAsync(flags.output, outputStr);
  }

  command.log(outputStr);
}

async function readInputArguments(name: string, encoding: string) {
  if (name.startsWith('http')) {
    const result = await fetch(name);
    return parseWithPointers(await result.text());
  } else if (existsSync(name)) {
    try {
      return parseWithPointers(readFileSync(name, encoding));
    } catch (ex) {
      throw new Error(`Could not read ${name}: ${ex.message}`);
    }
  }
  throw new Error(`${name} does not exist`);
}

function mergeConfig(config: IConfig, flags: any): IConfig {
  return merge(
    config,
    omitBy<IConfig>(
      {
        encoding: flags.encoding,
        format: flags.format,
        output: flags.output,
        maxResults: flags.maxResults,
        verbose: flags.verbose,
      },
      isNil
    )
  );
}
