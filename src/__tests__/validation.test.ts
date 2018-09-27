// import validation = require('..');

// const petstoreV2 = require('./fixtures/petstore.oas2.json');
// const petstoreV3 = require('./fixtures/petstore.oas3.json');

// const invalidV2 = require('./fixtures/todos.invalid.oas2.json');

// describe('validation', () => {
//   test('validate a correct OASv2 spec', () => {
//     const v = new validation.Validator();
//     const results = v.validate(petstoreV2, 'oas2');
//     expect(results.length).toEqual(0);
//   });

//   test('return errors on invalid OASv2 spec', () => {
//     const v = new validation.Validator();
//     const results = v.validate(invalidV2, 'oas2');
//     expect(results.length).toEqual(1);
//     expect(results[0].path).toEqual(['info', 'license', 'name']);
//     expect(results[0].message).toEqual('should be string');
//   });

//   test('validate a correct OASv3 spec', () => {
//     const v = new validation.Validator();
//     const results = v.validate(petstoreV3, 'oas3');
//     expect(results.length).toEqual(0);
//   });

//   test('validate multiple formats with same validator', () => {
//     const v = new validation.Validator();

//     let results = v.validate(petstoreV2, 'oas2');
//     expect(results.length).toEqual(0);

//     results = v.validate(petstoreV3, 'oas3');
//     expect(results.length).toEqual(0);
//   });

//   test('throw error on invalid spec format', () => {
//     const v = new validation.Validator();
//     const badFormat = 'banana';
//     expect(() => {
//       v.validate(petstoreV2, badFormat);
//     }).toThrow(`no schema with key or ref "${badFormat}"`);
//   });
// });
