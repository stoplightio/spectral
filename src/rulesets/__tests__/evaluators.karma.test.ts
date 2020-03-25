import { evaluateExport } from '../evaluators';

describe('Code evaluators', () => {
  describe('Export evaluator', () => {
    it('does not support require', () => {
      expect(evaluateExport.bind(null, `require('./d')`, null)).toThrowError(ReferenceError);
      expect(evaluateExport.bind(null, `require.resolve('./d')`, null)).toThrowError(ReferenceError);
      expect(evaluateExport.bind(null, `require.main`, null)).toThrowError(ReferenceError);
      expect(evaluateExport.bind(null, `require.cache`, null)).toThrowError(ReferenceError);
      expect(evaluateExport.bind(null, `require.extensions`, null)).toThrowError(ReferenceError);
    });
  });
});
