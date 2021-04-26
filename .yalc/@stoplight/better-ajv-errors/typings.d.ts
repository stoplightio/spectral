import { ErrorObject } from 'ajv';

declare var betterAjvErrors: betterAjvErrors.IBetterAjvErrors;

export = betterAjvErrors;
export as namespace betterAjvErrors;

declare namespace betterAjvErrors {
  export interface IInputOptions {
    propertyPath: Array<string | number>;
    targetValue: any;
  }

  export interface IOutputError {
    error: string;
    path: string;
    suggestion?: string;
  }

  export interface IBetterAjvErrors {
    (
      schema: any,
      errors?: ErrorObject[] | null,
      options?: IInputOptions,
    ): IOutputError[];
  }
}
