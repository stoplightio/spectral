import { upperCase } from 'lodash';

export default input => {
  if (upperCase(input) !== input) {
    return [{ message: 'must be upper case' }];
  }
};
