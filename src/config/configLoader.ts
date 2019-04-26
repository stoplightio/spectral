import { IParserResult } from '@stoplight/types';
import { existsSync } from 'fs-extra';
import { isEmpty, merge } from 'lodash';
import * as path from 'path';
import { readParsable } from '../fs/reader';
import { ConfigFormat, IConfig } from '../types/config';

const DEFAULT_CONFIG_FILE = 'spectral.yml';

const loadConfig = async (filePath: any): Promise<IConfig> => {
  switch (path.extname(filePath)) {
    case '.json':
    case '.yaml':
    case '.yml':
      const { data, diagnostics }: IParserResult = await readParsable(filePath, 'utf8');
      if (!isEmpty(diagnostics)) {
        throw new Error('Parsing exception');
      }
      return data;
    default:
      throw new Error('Unknown file');
  }
};

const extend = async (config: IConfig, filePath: string): Promise<IConfig> => {
  let configResult = Object.assign({}, config);
  const { extends: extendsValue } = config;
  if (extendsValue) {
    configResult = merge(await load(extendsValue, filePath), config);
  }
  delete configResult.extends;
  return configResult;
};

export const load = async (filePath: string, referencedPath: string = ''): Promise<IConfig> => {
  const resolvedPath: string = path.resolve(path.dirname(referencedPath), filePath);
  const config: IConfig = await loadConfig(resolvedPath);

  if (config.lint && config.lint.ruleset) {
    const { ruleset } = config.lint;
    config.lint.ruleset = Array.isArray(ruleset) ? ruleset : [ruleset];
  }

  if (config.extends) {
    return extend(config, resolvedPath);
  }

  return merge(createEmptyConfig(), config);
};

export const createEmptyConfig = (): IConfig => ({
  lint: {
    encoding: 'utf8',
    format: ConfigFormat.STYLISH,
    verbose: false,
  },
});

export const getDefaultConfigFile = (directory: string) => {
  const filePath = path.join(directory, DEFAULT_CONFIG_FILE);
  return existsSync(filePath) ? filePath : null;
};
