import { evaluateExport } from '../evaluators';

describe('Code evaluators', () => {
  describe('Export evaluator', () => {
    it('detects CJS default export', () => {
      const exported = evaluateExport(`module.exports = function a(x, y) {}`, null);
      expect(exported).toBeInstanceOf(Function);
      expect(exported).toHaveProperty('name', 'a');
      expect(exported).toHaveProperty('length', 2);
    });

    it('detects CJS-ES compatible default export', () => {
      const exported = evaluateExport(`exports.default = function b(x, y) {}`, null);
      expect(exported).toBeInstanceOf(Function);
      expect(exported).toHaveProperty('name', 'b');
      expect(exported).toHaveProperty('length', 2);
    });

    it('detects CJS-ES compatible default export variant #2', () => {
      const exported = evaluateExport(`module.exports.default = function c(x, y, z) {}`, null);
      expect(exported).toBeInstanceOf(Function);
      expect(exported).toHaveProperty('name', 'c');
      expect(exported).toHaveProperty('length', 3);
    });

    it('detects AMD export', () => {
      const exported = evaluateExport(`define(['exports'], () => function d(x){} )`, null);
      expect(exported).toBeInstanceOf(Function);
      expect(exported).toHaveProperty('name', 'd');
      expect(exported).toHaveProperty('length', 1);
    });

    it('detects anonymous AMD export', () => {
      const exported = evaluateExport(`define(() => function d(x){} )`, null);
      expect(exported).toBeInstanceOf(Function);
      expect(exported).toHaveProperty('name', 'd');
      expect(exported).toHaveProperty('length', 1);
    });

    it('detects context-based export', () => {
      const exported = evaluateExport(`this.returnExports = function e() {}`, null);
      expect(exported).toBeInstanceOf(Function);
      expect(exported).toHaveProperty('name', 'e');
      expect(exported).toHaveProperty('length', 0);
    });

    it('detects context-based export', () => {
      const exported = evaluateExport(`this.returnExports = function e() {}`, null);
      expect(exported).toBeInstanceOf(Function);
      expect(exported).toHaveProperty('name', 'e');
      expect(exported).toHaveProperty('length', 0);
    });

    it('throws error if no default export can be found', () => {
      expect(() => evaluateExport(`exports.a = function b(x, y) {}`, null)).toThrow();
    });

    it('throws error default export is not a function', () => {
      expect(() => evaluateExport(`module.exports = 2`, null)).toThrow();
      expect(() => evaluateExport(`this.returnExports = {}`, null)).toThrow();
    });

    describe('inject', () => {
      it('can expose any arbitrary value', () => {
        const fetch = jest.fn();
        const url = 'https://foo.bar';
        const fn = evaluateExport(`module.exports = () => fetch(url, { headers })`, null, {
          fetch,
          url,
          headers: {
            auth: 'Basic bar',
          },
        });

        fn();

        expect(fetch).toBeCalledWith(url, {
          headers: {
            auth: 'Basic bar',
          },
        });
      });
    });
  });
});
