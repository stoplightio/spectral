import * as AJV from 'ajv';
import { map } from 'lodash';
import * as oas3Ruleset from '../rulesets/oas3/ruleset.json';
import { Spectral } from '../spectral';
import { IFunction, IFunctionResult, ISchemaPathOptions, RuleType } from '../types';

const oasFormatValidator = require('ajv-oai/lib/format-validator');
const ajv = new AJV({ allErrors: true });

ajv.addFormat('int32', { type: 'number', validate: oasFormatValidator.int32 });
ajv.addFormat('int64', { type: 'number', validate: oasFormatValidator.int64 });
ajv.addFormat('float', { type: 'number', validate: oasFormatValidator.float });
ajv.addFormat('double', { type: 'number', validate: oasFormatValidator.double });
ajv.addFormat('byte', { type: 'string', validate: oasFormatValidator.byte });

export const validExamples: IFunction<ISchemaPathOptions> = async function(
  this: typeof Spectral,
  targetVal,
  opts,
  paths,
  otherValues,
) {
  const s = new this();
  const original = otherValues.original;

  const examples = map(original.examples, (val: any, key) => {
    return {
      [key]: { example: val.value, schema: original.schema },
    };
  });

  s.addRules({
    'valid-schema-example': Object.assign(oas3Ruleset.rules['valid-schema-example'], {
      enabled: true,
      type: RuleType[oas3Ruleset.rules['valid-schema-example'].type],
    }),
  });

  const [errors] = await Promise.all(examples.map(example => s.run(example)));

  return rmPaths(errors);
};

function rmPaths(errors: IFunctionResult[]) {
  return errors.map(err => {
    const { path, ...rest } = err;

    return { ...rest };
  });
}
