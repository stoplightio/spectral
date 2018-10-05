import { IRuleDefinitionBase } from './rule';

export interface ISchemaRule extends IRuleDefinitionBase {
  function: 'schema';
  input: {
    schema: object | string;
  };
}

export type ValidationRule = ISchemaRule;
