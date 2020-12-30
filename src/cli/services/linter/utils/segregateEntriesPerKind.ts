export function segregateEntriesPerKind(entries: Array<string | number>): [string[], number[]] {
  return entries.reduce<[string[], number[]]>(
    (group, entry) => {
      if (typeof entry === 'string') {
        group[0].push(entry);
      } else {
        group[1].push(entry);
      }

      return group;
    },
    [[], []],
  );
}
