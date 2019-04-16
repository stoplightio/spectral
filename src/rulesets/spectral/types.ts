export interface ISchema {
  [key: string]: IPrimitive | IEnum | IOr | IObject | IArray;
}

export interface IValue {
  optional?: boolean;
}

export interface IPrimitive extends IValue {
  type: 'string' | 'boolean' | 'any';
}

export interface IEnum extends IValue {
  type: 'enum';
  values: any[];
}

export interface IOr extends IValue {
  type: 'or';
  types: IValue[];
}

export interface IObject extends IValue {
  type: 'object';
  value: ISchema;
}

export interface IArray extends IValue {
  type: 'array';
  of: IValue[];
}
