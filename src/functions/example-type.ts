import * as AJV from 'ajv';
import { ErrorObject } from 'ajv';
import { get, last } from 'lodash';
import { IFunction, IFunctionPaths, ISchemaPathOptions } from '../types';
import { formatPath } from './schema';

const oasFormatValidator = require('ajv-oai/lib/format-validator');
const ajv = new AJV({ allErrors: true });

ajv.addFormat('int32', { type: 'number', validate: oasFormatValidator.int32 });
ajv.addFormat('int64', { type: 'number', validate: oasFormatValidator.int64 });
ajv.addFormat('float', { type: 'number', validate: oasFormatValidator.float });
ajv.addFormat('double', { type: 'number', validate: oasFormatValidator.double });
ajv.addFormat('byte', { type: 'string', validate: oasFormatValidator.byte });

export const example: IFunction<ISchemaPathOptions> = async (targetVal, opts, paths, otherValues) => {
  const original = otherValues.original;
  const validate = ajv.compile(original);

  validate(original.example);

  const path = paths.target || paths.given;
  const ajvErrs = get(validate, 'errors');

  const errs =
    ajvErrs &&
    ajvErrs.map((err: ErrorObject) => {
      const dataPath = get(err, 'dataPath');

      return {
        message: (dataPath ? `${dataPath} ` : '') + err.message,
        path: [...path, ...formatPath(err.dataPath)],
      };
    });

  return isTypeInsideSchema(paths) ? [] : errs || [];
};

function isTypeInsideSchema(paths: IFunctionPaths) {
  const given = get(paths, 'given');

  return last(given) === 'schema';
}
