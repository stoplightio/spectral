import upperCase from 'lodash.uppercase';

export default input => {
  if (upperCase(input) !== input) {
    return [{ message: 'must be upper case' }];
  }
};
