import * as path from '@stoplight/path';
import { getDefaultRulesetFile } from '../getDefaultRulesetFile';

const ROOT = path.join(__dirname, './__fixtures__');

describe('getDefaultRulesetFile util', () => {
  it('should resolve with null if a default ruleset does not exist', () => {
    return expect(getDefaultRulesetFile(path.join(ROOT, './empty'))).resolves.toBeNull();
  });

  it('should resolve with a path to found ruleset if there is any matching', async () => {
    await expect(getDefaultRulesetFile(ROOT)).resolves.toEqual(path.join(ROOT, './spectral.json'));
    await expect(getDefaultRulesetFile(path.join(ROOT, './yaml'))).resolves.toEqual(
      path.join(ROOT, './yaml/.spectral.yaml'),
    );
  });
});
