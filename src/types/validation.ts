import { IRuleDefinitionBase } from './index';

export interface ISchemaRule extends IRuleDefinitionBase {
  function: 'schema';
  input: {
    schema: object | string;
  };
}

export type ValidationRule = ISchemaRule;
