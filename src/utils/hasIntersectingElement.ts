export const hasIntersectingElement = (left: unknown[], right: unknown[]): boolean =>
  left.some(item => right.includes(item));
