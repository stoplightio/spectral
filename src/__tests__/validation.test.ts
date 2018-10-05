import { Spectral } from '../index';
import { oas2Preset } from '../presets/oas2';
import { oas3Preset } from '../presets/oas3';

import * as petstoreV2 from './fixtures/petstore.oas2.json';
import * as petstoreV3 from './fixtures/petstore.oas3.json';

const invalidV2 = require('./fixtures/todos.invalid.oas2.json');

describe('validation', () => {
  test('validate a correct OASv2 spec', () => {
    const s = new Spectral({ rulesets: [oas2Preset()] });
    const results = s.run({ target: petstoreV2, spec: 'oas2', type: 'validation' });
    expect(results.length).toEqual(0);
  });

  test('return errors on invalid OASv2 spec', () => {
    const s = new Spectral({ rulesets: [oas2Preset()] });
    const results = s.run({ target: invalidV2, spec: 'oas2', type: 'validation' });
    expect(results.length).toEqual(1);
    expect(results[0].path).toEqual(['info', 'license', 'name']);
    expect(results[0].message).toEqual('should be string');
  });

  test('validate a correct OASv3 spec', () => {
    const s = new Spectral({ rulesets: [oas3Preset()] });
    const results = s.run({ target: petstoreV3, spec: 'oas3', type: 'validation' });
    expect(results.length).toEqual(0);
  });

  test('validate multiple formats with same validator', () => {
    const s = new Spectral({ rulesets: [oas2Preset(), oas3Preset()] });

    let results = s.run({ target: petstoreV2, spec: 'oas2', type: 'validation' });
    expect(results.length).toEqual(0);

    results = s.run({ target: invalidV2, spec: 'oas2', type: 'validation' });
    expect(results.length).toEqual(1);

    results = s.run({ target: petstoreV3, spec: 'oas3', type: 'validation' });
    expect(results.length).toEqual(0);
  });
});
