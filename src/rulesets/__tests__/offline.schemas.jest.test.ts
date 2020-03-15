import * as path from '@stoplight/path';
import * as fs from 'fs';
import * as nock from 'nock';

import { Document } from '../../document';
import { isOpenApiv2, isOpenApiv3 } from '../../formats';
import { readParsable } from '../../fs/reader';
import { Spectral } from '../../index';
import * as Parsers from '../../parsers';
import { httpAndFileResolver } from '../../resolvers/http-and-file';
import { FormatLookup } from '../../types';

interface ITestCases {
  [rulesetname: string]: {
    fixtures: Array<{
      fixture: string;
      format: { name: string; lookupFn: FormatLookup };
    }>;
  };
}

const knownRulesets: ITestCases = {
  'spectral:oas': {
    fixtures: [
      {
        fixture: '../../__tests__/__fixtures__/petstore.oas2.json',
        format: { name: 'oas2', lookupFn: isOpenApiv2 },
      },
      {
        fixture: '../../__tests__/__fixtures__/petstore.oas3.json',
        format: { name: 'oas3', lookupFn: isOpenApiv3 },
      },
    ],
  },
};

type FlattenedTestCases = [string, string, string, FormatLookup];

const flattenedTestCases = Object.entries(knownRulesets).reduce<FlattenedTestCases[]>((flattened, [key, testCase]) => {
  for (const f of testCase.fixtures) {
    flattened.push([key, f.fixture, f.format.name, f.format.lookupFn]);
  }
  return flattened;
}, []);

describe('Online vs Offline context', () => {
  afterEach(() => {
    Spectral.registerStaticAssets({});
    nock.enableNetConnect();
  });

  test.each(flattenedTestCases)(
    'Using ruleset "%s", lint "%s" using format "%s"',
    async (ruleset: string, fixture: string, formatName: string, formatLookup: FormatLookup) => {
      const fixturePath = path.join(__dirname, fixture);
      const content = await readParsable(fixturePath, { encoding: 'utf8' });
      const document = new Document(content, Parsers.Json, fixturePath);

      const resolvingSpectral = new Spectral({ resolver: httpAndFileResolver });
      resolvingSpectral.registerFormat(formatName, formatLookup);
      await resolvingSpectral.loadRuleset(ruleset);

      const onlineResults = await resolvingSpectral.run(document);

      Spectral.registerStaticAssets(require('../../../rulesets/assets/assets.json'));

      const offlineSpectral = new Spectral();
      offlineSpectral.registerFormat(formatName, formatLookup);
      await offlineSpectral.loadRuleset(ruleset);

      const readFileSpy = jest.spyOn(fs, 'readFile').mockImplementation(() => {
        throw new Error();
      });

      nock.disableNetConnect();

      const offlineResults = await offlineSpectral.run(document);

      readFileSpy.mockRestore();

      expect(offlineResults).toEqual(onlineResults);
    },
  );

  test('all rulesets are accounted for', async () => {
    const dir = path.join(__dirname, '../../../rulesets/');

    // Would that fail, run  `yarn generate-assets` ;-)
    expect(fs.existsSync(dir)).toBeTruthy();

    const discoveredRulesets: string[] = [];

    fs.readdirSync(dir).forEach(name => {
      if (name === 'assets') {
        return;
      }

      const target = path.join(dir, name);
      const stats = fs.statSync(target);
      if (!stats.isDirectory()) {
        return;
      }

      discoveredRulesets.push(`spectral:${name}`);
    });

    // Will fail when a ruleset has not been added to the `knownRulesets` variable
    expect(discoveredRulesets).toEqual(Object.keys(knownRulesets));
  });
});
