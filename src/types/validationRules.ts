import { IRuleDefinitionBase } from './index';

export interface IFunctionRule extends IRuleDefinitionBase {
  type: 'function';
}

export interface ISchemaRule extends IRuleDefinitionBase {
  type: 'schema';
  schema: object;
}

export type ValidationRule = ISchemaRule | IFunctionRule;
