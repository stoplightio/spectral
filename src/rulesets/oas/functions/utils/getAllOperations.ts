import { isObject } from './isObject';

const validOperationKeys = ['get', 'head', 'post', 'put', 'patch', 'delete', 'options', 'trace'];

export function* getAllOperations(paths: unknown): IterableIterator<{ path: string; operation: string }> {
  if (!isObject(paths)) {
    return;
  }

  const item = {
    path: '',
    operation: '',
  };

  for (const path of Object.keys(paths)) {
    const operations = paths[path];
    if (!isObject(operations)) {
      continue;
    }

    item.path = path;

    for (const operation of Object.keys(operations)) {
      if (!isObject(operations[operation]) || !validOperationKeys.includes(operation)) {
        continue;
      }

      item.operation = operation;

      yield item;
    }
  }
}
