import * as AJV from 'ajv';
import { IFunction, ISchemaPathOptions } from '../types';

const oasFormatValidator = require('ajv-oai/lib/format-validator');
const ajv = new AJV({ allErrors: true });

ajv.addFormat('int32', { type: 'number', validate: oasFormatValidator.int32 });
ajv.addFormat('int64', { type: 'number', validate: oasFormatValidator.int64 });
ajv.addFormat('float', { type: 'number', validate: oasFormatValidator.float });
ajv.addFormat('double', { type: 'number', validate: oasFormatValidator.double });
ajv.addFormat('byte', { type: 'string', validate: oasFormatValidator.byte });

import { decodePointerFragment } from '@stoplight/json';

const formatPath = (path: string) =>
  path
    .split('/')
    .slice(1)
    .map(decodePointerFragment);

export const example: IFunction<ISchemaPathOptions> = async (targetVal, opts, paths, otherValues) => {
  const original = otherValues.original;
  const validate = ajv.compile(original);

  validate(original.example);

  const path = paths.target || paths.given;

  const errs =
    validate.errors &&
    validate.errors.map((err: any) => ({
      message: (err.dataPath ? `${err.dataPath} ` : '') + err.message,
      path: [...path, ...formatPath(err.dataPath)],
    }));

  return (paths && paths.given && paths.given[paths.given.length - 1]) === 'schema' ? [] : errs || [];
};
