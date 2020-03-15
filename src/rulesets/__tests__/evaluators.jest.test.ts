import * as path from '@stoplight/path';
import { evaluateExport } from '../evaluators';

describe('Code evaluators', () => {
  describe('Export evaluator', () => {
    it('supports require', () => {
      expect(evaluateExport(`module.exports = require('./foo')`, path.join(__dirname, '__fixtures__/a.js'))()).toEqual(
        'hello!',
      );

      expect(
        evaluateExport(
          `module.exports = () => require('path').join('/', 'hello!')`,
          path.join(__dirname, '__fixtures__/a.js'),
        )(),
      ).toEqual(require('path').join('/', 'hello!'));

      expect(
        evaluateExport(
          `module.exports = () => require('@stoplight/path').join('/', 'hello!')`,
          path.join(__dirname, '__fixtures__/a.js'),
        )(),
      ).toEqual(path.join('/', 'hello!'));
    });

    it('supports require.resolve', () => {
      expect(
        path.normalize(
          evaluateExport(
            `module.exports = () => require.resolve('./foo', { paths: ['${path.join(__dirname, '__fixtures__')}'] } )`,
            null,
          )(),
        ),
      ).toEqual(path.join(__dirname, '__fixtures__/foo.js'));
    });

    it.each(['cache', 'extensions'])('exposes %s', member => {
      expect(evaluateExport(`module.exports = () => require['${member}']`, null)()).toStrictEqual(require[member]);
    });
  });
});
