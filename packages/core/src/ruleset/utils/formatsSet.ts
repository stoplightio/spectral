import type { Format } from '../format';

function printFormat(format: Format): string {
  return format.displayName ?? format.name;
}

export class FormatsSet<T extends Format = Format> extends Set<T> {
  public toJSON(): string[] {
    return Array.from(this).map(printFormat);
  }
}
