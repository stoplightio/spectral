import { evaluateExport } from '../evaluators';

describe('Code evaluators', () => {
  it('detects CJS default export', () => {
    const exported = evaluateExport(`module.exports = function a(x, y) {}`);
    expect(exported).toBeInstanceOf(Function);
    expect(exported).toHaveProperty('name', 'a');
    expect(exported).toHaveProperty('length', 2);
  });

  it('detects CJS-ES compatible default export', () => {
    const exported = evaluateExport(`exports.default = function b(x, y) {}`);
    expect(exported).toBeInstanceOf(Function);
    expect(exported).toHaveProperty('name', 'b');
    expect(exported).toHaveProperty('length', 2);
  });

  it('detects CJS-ES compatible default export variant #2', () => {
    const exported = evaluateExport(`module.exports.default = function c(x, y, z) {}`);
    expect(exported).toBeInstanceOf(Function);
    expect(exported).toHaveProperty('name', 'c');
    expect(exported).toHaveProperty('length', 3);
  });

  // todo: verify whether it's valid scenario
  it('detects AMD export', () => {
    const exported = evaluateExport(`define([], () => function d(x){} )`);
    expect(exported).toBeInstanceOf(Function);
    expect(exported).toHaveProperty('name', 'd');
    expect(exported).toHaveProperty('length', 1);
  });

  it('detects context-based export', () => {
    const exported = evaluateExport(`this.returnExports = function e() {}`);
    expect(exported).toBeInstanceOf(Function);
    expect(exported).toHaveProperty('name', 'e');
    expect(exported).toHaveProperty('length', 0);
  });
});
