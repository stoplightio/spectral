export const isObject = (thing: unknown): thing is object => thing !== null && typeof thing === 'object';
