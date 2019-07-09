import { IParserResult } from '@stoplight/types';
import { existsSync } from 'fs';
import { isEmpty, merge } from 'lodash';
import * as path from 'path';
import { readParsable } from '../fs/reader';
import { ConfigCommand, ConfigFormat, IConfig } from '../types/config';

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

export const load = async (filePath: string, command: ConfigCommand): Promise<IConfig> => {
  const config: IConfig = await loadConfig(filePath);
  validate(config, command);
  normalize(config, command);
  return merge(createEmptyConfig(), config);
};

export const validate = (config: IConfig, command: ConfigCommand) => {
  if (!config) throw new Error('Missing config');
  if (!config[command]) throw new Error(`Missing ${command} command in config file`);
};

export const normalize = (config: IConfig, command: ConfigCommand) => {
  switch (command) {
    case ConfigCommand.LINT:
      if (config.lint.ruleset) {
        const { ruleset } = config.lint;
        config.lint.ruleset = Array.isArray(ruleset) ? ruleset : [ruleset];
      }
      break;
  }
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
