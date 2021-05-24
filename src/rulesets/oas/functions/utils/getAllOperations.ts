import { isObject } from './isObject';

const validOperationKeys = ['get', 'head', 'post', 'put', 'patch', 'delete', 'options', 'trace'];

type Item = { path: string; operation: string; value: unknown };

export function* getAllOperations(paths: unknown): IterableIterator<Item> {
  if (!isObject(paths)) {
    return;
  }

  const item: Item = {
    path: '',
    operation: '',
    value: null,
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
      item.value = operations[operation];

      yield item;
    }
  }
}
