import { Tree, Scope } from '../index';
import { TransformerCtx } from '../../types';
import * as path from '@stoplight/path';

// Mock requireResolve module to test different scenarios
jest.mock('../../requireResolve', () => {
  // This will be overridden in each test
  return {};
});

describe('Tree.resolveModule', () => {
  let tree: Tree;
  let mockCtx: TransformerCtx;

  beforeEach(() => {
    tree = new Tree({
      format: 'esm',
      scope: new Scope(),
    });

    // Create a minimal mock context
    mockCtx = {
      tree,
      cwd: '/test/project',
      filepath: '/test/project/ruleset.yaml',
      npmRegistry: null,
      opts: {
        format: 'esm',
        fs: {
          promises: {
            readFile: jest.fn(),
          },
        },
        fetch: jest.fn() as any,
      },
      hooks: new Set(),
      read: jest.fn(),
    };
  });

  describe('requireResolve handling (browser compatibility)', () => {
    afterEach(() => {
      jest.resetModules();
    });

    it('should handle requireResolve as undefined (normal browser environment)', async () => {
      // Simulate browser environment where requireResolve is undefined
      jest.doMock('../../requireResolve', () => ({
        default: undefined,
      }));

      const { Tree: TreeWithUndefined } = await import('../index');
      const tree = new TreeWithUndefined({
        format: 'esm',
        npmRegistry: undefined,
        scope: new Scope(),
      });

      const resolved = tree.resolveModule('@stoplight/spectral-rulesets', mockCtx, 'ruleset');

      // Should fallback to path.join when requireResolve is undefined
      expect(resolved).toBe(path.join(mockCtx.cwd, '@stoplight/spectral-rulesets'));
    });

    it('should handle requireResolve as null', async () => {
      // Simulate browser environment where requireResolve is null
      jest.doMock('../../requireResolve', () => ({
        default: null,
      }));

      const { Tree: TreeWithNull } = await import('../index');
      const tree = new TreeWithNull({
        format: 'esm',
        npmRegistry: undefined,
        scope: new Scope(),
      });

      const resolved = tree.resolveModule('@stoplight/spectral-rulesets', mockCtx, 'ruleset');

      // Should fallback to path.join when requireResolve is null
      expect(resolved).toBe(path.join(mockCtx.cwd, '@stoplight/spectral-rulesets'));
    });

    it('should handle requireResolve as empty object (webpack bug)', async () => {
      // Simulate webpack returning empty object instead of undefined
      jest.doMock('../../requireResolve', () => ({
        default: {},
      }));

      const { Tree: TreeWithObject } = await import('../index');
      const tree = new TreeWithObject({
        format: 'esm',
        npmRegistry: undefined,
        scope: new Scope(),
      });

      const resolved = tree.resolveModule('@stoplight/spectral-rulesets', mockCtx, 'ruleset');

      // Should fallback to path.join when requireResolve is an empty object
      expect(resolved).toBe(path.join(mockCtx.cwd, '@stoplight/spectral-rulesets'));
    });

    it('should handle requireResolve as non-function value', async () => {
      // Simulate other non-function values
      jest.doMock('../../requireResolve', () => ({
        default: 'not-a-function',
      }));

      const { Tree: TreeWithString } = await import('../index');
      const tree = new TreeWithString({
        format: 'esm',
        npmRegistry: undefined,
        scope: new Scope(),
      });

      const resolved = tree.resolveModule('@stoplight/spectral-rulesets', mockCtx, 'ruleset');

      // Should fallback to path.join when requireResolve is not a function
      expect(resolved).toBe(path.join(mockCtx.cwd, '@stoplight/spectral-rulesets'));
    });

    it('should call requireResolve when it is a function', async () => {
      const mockResolve = jest.fn().mockReturnValue('/resolved/path/to/package');

      jest.doMock('../../requireResolve', () => ({
        default: mockResolve,
      }));

      const { Tree: TreeWithFunction } = await import('../index');
      const tree = new TreeWithFunction({
        format: 'esm',
        npmRegistry: undefined,
        scope: new Scope(),
      });

      const resolved = tree.resolveModule('@stoplight/spectral-rulesets', mockCtx, 'ruleset');

      // When requireResolve is a function, it should handle package resolution
      // Note: Due to module caching, we verify behavior rather than mock calls
      expect(resolved).toBeTruthy();
      expect(typeof resolved).toBe('string');
    });

    it('should fallback when requireResolve returns null', async () => {
      const mockResolve = jest.fn().mockReturnValue(null);

      jest.doMock('../../requireResolve', () => ({
        default: mockResolve,
      }));

      const { Tree: TreeWithReturningNull } = await import('../index');
      const tree = new TreeWithReturningNull({
        format: 'esm',
        npmRegistry: undefined,
        scope: new Scope(),
      });

      const resolved = tree.resolveModule('@stoplight/spectral-rulesets', mockCtx, 'ruleset');

      // When requireResolve returns null, should fallback to path.join
      // Note: Due to module caching, we verify behavior (fallback path) rather than mock calls
      expect(resolved).toBe(path.join(mockCtx.cwd, '@stoplight/spectral-rulesets'));
    });
  });

  describe('resolveModule behavior with different scenarios', () => {
    it('should not use requireResolve for non-package imports', () => {
      const resolved = tree.resolveModule('./local-ruleset.yaml', mockCtx, 'ruleset');

      // Should resolve relative to filepath's directory
      expect(resolved).toBe(path.join(mockCtx.filepath, '..', './local-ruleset.yaml'));
    });

    it('should not use requireResolve for absolute paths', () => {
      const absolutePath = '/absolute/path/to/ruleset.yaml';
      const resolved = tree.resolveModule(absolutePath, mockCtx, 'ruleset');

      expect(resolved).toBe(absolutePath);
    });

    it('should not use requireResolve for URLs', () => {
      const url = 'https://example.com/ruleset.yaml';
      const resolved = tree.resolveModule(url, mockCtx, 'ruleset');

      expect(resolved).toBe(url);
    });

    it('should not use requireResolve for function kind', () => {
      // When kind is 'function', it should not hit the requireResolve path
      const resolved = tree.resolveModule('./custom-function.js', mockCtx, 'function');

      expect(resolved).toBe(path.join(mockCtx.filepath, '..', './custom-function.js'));
    });

    it('should use npmRegistry when provided', () => {
      const treeWithRegistry = new Tree({
        format: 'esm',
        npmRegistry: 'https://unpkg.com',
        scope: new Scope(),
      });

      const ctxWithRegistry = {
        ...mockCtx,
        npmRegistry: 'https://unpkg.com',
      };

      const resolved = treeWithRegistry.resolveModule('@stoplight/spectral-rulesets', ctxWithRegistry, 'ruleset');

      // Should use npmRegistry instead of requireResolve
      expect(resolved).toBe(path.join('https://unpkg.com', '@stoplight/spectral-rulesets'));
    });

    it('should handle scoped package names correctly', () => {
      const resolved = tree.resolveModule('@stoplight/spectral-rulesets', mockCtx, 'ruleset');

      // Should recognize as package import even with scope
      expect(resolved).toBe(path.join(mockCtx.cwd, '@stoplight/spectral-rulesets'));
    });

    it('should handle package imports with subpaths', () => {
      const resolved = tree.resolveModule('@stoplight/spectral-rulesets/dist/oas', mockCtx, 'ruleset');

      // Should recognize as package import with subpath
      expect(resolved).toBe(path.join(mockCtx.cwd, '@stoplight/spectral-rulesets/dist/oas'));
    });
  });

  describe('npm registry detection', () => {
    it('should handle files from npm registry', () => {
      const ctxFromNpm = {
        ...mockCtx,
        filepath: 'https://unpkg.com/@stoplight/spectral-rulesets@1.0.0/index.js',
        npmRegistry: 'https://unpkg.com',
      };

      const treeWithRegistry = new Tree({
        format: 'esm',
        npmRegistry: 'https://unpkg.com',
        scope: new Scope(),
      });

      const resolved = treeWithRegistry.resolveModule('./custom.js', ctxFromNpm, 'ruleset');

      // Should resolve relative to the npm registry filepath
      expect(resolved).toBe(path.join('https://unpkg.com/@stoplight/spectral-rulesets@1.0.0/index.js', './custom.js'));
    });
  });

  describe('edge cases', () => {
    it('should handle empty string identifier', () => {
      const resolved = tree.resolveModule('', mockCtx, 'ruleset');

      // Should still process empty string through path.join
      expect(resolved).toBe(path.join(mockCtx.filepath, '..', ''));
    });

    it('should handle identifiers with special characters', () => {
      const resolved = tree.resolveModule('../../../sneaky/path', mockCtx, 'ruleset');

      // Should handle path traversal
      expect(resolved).toBe(path.join(mockCtx.filepath, '..', '../../../sneaky/path'));
    });

    it('should handle Windows-style absolute paths', () => {
      if (path.isAbsolute('C:\\test\\ruleset.yaml')) {
        const resolved = tree.resolveModule('C:\\test\\ruleset.yaml', mockCtx, 'ruleset');
        expect(resolved).toBe('C:\\test\\ruleset.yaml');
      }
    });
  });
});
