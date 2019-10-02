export const hasRef = (obj: object): obj is object & { $ref: string } =>
  '$ref' in obj && typeof (obj as Partial<{ $ref: unknown }>).$ref === 'string';
