import { BundleOptions, bundleRuleset } from '../../index';
import { stdin } from '../stdin';

describe('Stdin Plugin', () => {
  describe.each<BundleOptions['target']>(['browser', 'runtime'])('given %s target', target => {
    it('should default to <stdin>', async () => {
      const code = await bundleRuleset('<stdin>', {
        format: 'esm',
        target,
        plugins: [stdin('export default `works`')],
      });

      expect(code).toEqual(`var _stdin_ = \`works\`;

export { _stdin_ as default };
`);
    });

    it('should accept any arbitrary path', async () => {
      const code = await bundleRuleset('/spectral.json', {
        format: 'esm',
        target,
        plugins: [stdin('export default { rules: {} }', '/spectral.json')],
      });

      expect(code).toEqual(`var spectral = { rules: {} };

export { spectral as default };
`);
    });

    it('given unmatched path, should be a no-op', async () => {
      await expect(
        bundleRuleset('/spectral.js', {
          format: 'esm',
          target,
          plugins: [stdin('export default { rules: {} }', '/spectral.json')],
        }),
      ).rejects.toThrow();
    });
  });
});
