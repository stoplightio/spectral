export interface ISchema {
  [key: string]: IValue | IEnum | IOr | IObject | IArray;
}

export interface IValue {
  type: 'object' | 'enum' | 'array' | 'string' | 'boolean' | 'or' | 'any';
  optional?: boolean;
}

export interface IEnum extends IValue {
  type: 'enum';
  values?: any[];
}

export interface IOr extends IValue {
  type: 'or';
  types?: IValue[];
}

export interface IObject extends IValue {
  type: 'object';
  value?: ISchema;
}

export interface IArray extends IValue {
  type: 'array';
  of?: IValue[];
}
