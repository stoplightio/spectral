import * as path from '@stoplight/path';
import { getDefaultRulesetFile } from '../configLoader';

const ROOT = path.join(__dirname, './__fixtures__');

describe('config loading', () => {
  describe('getDefaultRulesetFile', () => {
    test('should resolve with null if a default config does not exist', () => {
      return expect(getDefaultRulesetFile(path.join(ROOT, './empty'))).resolves.toBeNull();
    });

    test('should resolve with a path to found config if there is any matching', async () => {
      await expect(getDefaultRulesetFile(ROOT)).resolves.toEqual(path.join(ROOT, './spectral.json'));
      await expect(getDefaultRulesetFile(path.join(ROOT, './yaml'))).resolves.toEqual(
        path.join(ROOT, './yaml/.spectral.yaml'),
      );
    });
  });
});
