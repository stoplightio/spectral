import { decodePointerFragment, pathToPointer } from '@stoplight/json';
import { JsonPath, Segment } from '@stoplight/types';

export enum PrintStyle {
  Dot = 'dot',
  Pointer = 'pointer',
  EscapedPointer = 'escapedPointer',
}

const isNumeric = (input: Segment) => typeof input === 'number' || !Number.isNaN(Number(input));
const hasWhitespace = (input: string) => /\s/.test(input);
const safeDecodePointerFragment = (segment: Segment) =>
  typeof segment === 'number' ? segment : decodePointerFragment(segment);

const printDotBracketsSegment = (segment: Segment) => {
  if (typeof segment === 'number') {
    return `[${segment}]`;
  }

  if (segment.length === 0) {
    return `['']`;
  }

  if (hasWhitespace(segment)) {
    return `['${segment}']`;
  }

  if (isNumeric(segment)) {
    return `[${segment}]`;
  }

  return null;
};

const pathToDotString = (path: JsonPath) =>
  path.reduce<string>(
    (output, segment, index) => `${output}${printDotBracketsSegment(segment) ?? `${index === 0 ? '' : '.'}${segment}`}`,
    '',
  );

export const printPath = (path: JsonPath, style: PrintStyle) => {
  switch (style) {
    case PrintStyle.Dot:
      return decodePointerFragment(pathToDotString(path));
    case PrintStyle.Pointer:
      if (path.length === 0) {
        return '#';
      }

      return `#/${decodePointerFragment(path.join('/'))}`;
    case PrintStyle.EscapedPointer:
      return pathToPointer(path.map(safeDecodePointerFragment));
    default:
      return String(path);
  }
};
