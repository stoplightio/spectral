export const segregateEntriesPerKind = (entries: Array<string | number>): [string[], number[]] => {
  return entries.reduce(
    (group, entry) => {
      if (typeof entry === 'string') {
        group[0].push(entry);
        return group;
      }

      group[1].push(entry);
      return group;
    },
    [[], []] as [string[], number[]],
  );
};
