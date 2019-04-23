import { ErrorObject } from 'ajv';
import chalk from 'chalk';

export const formatAjv = (errors: ErrorObject[]): string => {
  let output = '\n';
  errors.forEach(error => {
    output += `${chalk.underline(error.dataPath)} \t ${error.message} \n`;
  });
  return output;
};
