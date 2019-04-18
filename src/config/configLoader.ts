import { IParserResult } from '@stoplight/types';
import { isEmpty, merge } from 'lodash';
import * as path from 'path';
import { readParsable } from '../fs/reader';
import { ConfigFormat, IConfig } from '../types/config';

const loadConfig = (filePath: any) => {
  let config;

  switch (path.extname(filePath)) {
    case '.json':
    case '.yaml':
    case '.yml':
      config = readParsable(filePath, 'utf8');
      break;
    default:
      throw new Error('Unknown file');
  }

  return config;
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

export const load = async (filePath: string, referencedPath: string): Promise<IConfig> => {
  const resolvedPath: string = path.resolve(path.dirname(referencedPath), filePath);
  const config: IParserResult = await loadConfig(resolvedPath);

  // validate
  const { diagnostics, data } = config;
  if (!isEmpty(diagnostics)) {
    throw new Error('Parsing exception');
  }

  if (data.extends) {
    return extend(data, resolvedPath);
  }

  return merge(createEmptyConfig(), data);
};

export const createEmptyConfig = (): IConfig => ({
  encoding: 'utf8',
  format: ConfigFormat.STYLISH,
  verbose: false,
});
