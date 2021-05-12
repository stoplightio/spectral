import { evaluateExport, setFunctionContext } from '../evaluators';

describe('Code evaluators', () => {
  describe('Export evaluator', () => {
    it('detects CJS default export', () => {
      const exported = evaluateExport(`module.exports = function a(x, y) {}`, null, null);
      expect(exported).toBeInstanceOf(Function);
      expect(exported).toHaveProperty('name', 'a');
      expect(exported).toHaveProperty('length', 2);
    });

    it('detects CJS-ES compatible default export', () => {
      const exported = evaluateExport(`exports.default = function b(x, y) {}`, null, null);
      expect(exported).toBeInstanceOf(Function);
      expect(exported).toHaveProperty('name', 'b');
      expect(exported).toHaveProperty('length', 2);
    });

    it('detects CJS-ES compatible default export variant #2', () => {
      const exported = evaluateExport(`module.exports.default = function c(x, y, z) {}`, null, null);
      expect(exported).toBeInstanceOf(Function);
      expect(exported).toHaveProperty('name', 'c');
      expect(exported).toHaveProperty('length', 3);
    });

    it('detects AMD export', () => {
      const exported = evaluateExport(`define(['exports'], () => function d(x){} )`, null, null);
      expect(exported).toBeInstanceOf(Function);
      expect(exported).toHaveProperty('name', 'd');
      expect(exported).toHaveProperty('length', 1);
    });

    it('detects anonymous AMD export', () => {
      const exported = evaluateExport(`define(() => function d(x){} )`, null, null);
      expect(exported).toBeInstanceOf(Function);
      expect(exported).toHaveProperty('name', 'd');
      expect(exported).toHaveProperty('length', 1);
    });

    it('detects context-based export', () => {
      const exported = evaluateExport(`this.returnExports = function e() {}`, null, null);
      expect(exported).toBeInstanceOf(Function);
      expect(exported).toHaveProperty('name', 'e');
      expect(exported).toHaveProperty('length', 0);
    });

    it('detects context-based export', () => {
      const exported = evaluateExport(`this.returnExports = function e() {}`, null, null);
      expect(exported).toBeInstanceOf(Function);
      expect(exported).toHaveProperty('name', 'e');
      expect(exported).toHaveProperty('length', 0);
    });

    it('throws error if no default export can be found', () => {
      expect(() => evaluateExport(`exports.a = function b(x, y) {}`, null, null)).toThrow();
    });

    it('throws error default export is not a function', () => {
      expect(() => evaluateExport(`module.exports = 2`, null, null)).toThrow();
      expect(() => evaluateExport(`this.returnExports = {}`, null, null)).toThrow();
    });

    describe('inject', () => {
      it('can expose any arbitrary value', () => {
        const fetch = jest.fn();
        const url = 'https://foo.bar';
        const fn = evaluateExport(`module.exports = () => fetch(url, { headers })`, null, null, {
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

  describe('setFunctionContext', () => {
    it('binds context to given function', () => {
      const context = { a: true };
      const fn = setFunctionContext(context, jest.fn().mockReturnThis());
      expect(fn()).toStrictEqual({ a: true });
    });

    it('deep-copies provided context', () => {
      const context = { a: true };
      const fn = setFunctionContext(context, jest.fn().mockReturnThis());
      const fn2 = setFunctionContext(context, jest.fn().mockReturnThis());
      expect(fn()).not.toBe(fn2());
    });

    it('copies enumerable properties', () => {
      const context = { a: true };
      const prop = Object.freeze({});
      const fn = function () {
        return;
      };

      fn.foo = prop;

      const boundFn = setFunctionContext(context, fn);
      expect(boundFn.foo).toBe(prop);
    });
  });
});
