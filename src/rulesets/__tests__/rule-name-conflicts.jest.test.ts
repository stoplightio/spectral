import * as fs from 'fs';

describe('Rule name conflicts among rulesets', () => {
  test.each([
    ['oas', 'oas2'],
    ['oas2', 'oas3'],
    ['oas3', 'oas'],
  ])('do not exist (comparing %s with %s)', (one, another) => {
    const oneContent = JSON.parse(fs.readFileSync(`${__dirname}/../${one}/index.json`, { encoding: 'utf8' }));
    const anotherContent = JSON.parse(fs.readFileSync(`${__dirname}/../${another}/index.json`, { encoding: 'utf8' }));

    interface IDescriptor {
      name: string;
      source: string;
    }

    const consolidated: Record<string, IDescriptor> = {};

    const consolidate = (content: string, source: string) => {
      Object.keys(content).forEach(key => {
        consolidated[`${key}-${source}`] = { name: key, source };
      });
    };

    consolidate(oneContent.rules, one);
    consolidate(anotherContent.rules, another);

    const sorted: Record<string, IDescriptor> = Object.keys(consolidated)
      .sort()
      .reduce(
        (acc, key) => ({
          ...acc,
          [key]: consolidated[key],
        }),
        {},
      );

    const keys = Object.keys(sorted);
    for (let i = 0; i < keys.length - 1; i++) {
      const current = sorted[keys[i]];
      const next = sorted[keys[i + 1]];
      if (current.name !== next.name) {
        continue;
      }

      throw new Error(`Rule name collision detected
- ${current.name} (${current.source})
- ${next.name} (${next.source})`);
    }
  });
});
