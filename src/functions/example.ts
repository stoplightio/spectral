export function example(a: any, b: any, c: any, d: any) {
  const original = d.original;

  const type = (original.schema && original.schema.type) || original.type;

  return type && typeof original.example !== type
    ? [
        {
          message: `${original.example} is not of type ${type}`,
        },
      ]
    : [];
}
