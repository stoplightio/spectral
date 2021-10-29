export enum CasingType {
  flat = 'flat',
  camel = 'camel',
  pascal = 'pascal',
  kebab = 'kebab',
  cobol = 'cobol',
  snake = 'snake',
  macro = 'macro',
}

export type CasingOptions = {
  type: CasingType;
  disallowDigits?: boolean;
  separator?: {
    char: string;
    allowLeading?: boolean;
  };
};
