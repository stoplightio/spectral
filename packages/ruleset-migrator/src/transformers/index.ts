import _extends from './extends';
import formats from './formats';
import functions from './functions';
import rules from './rules';
import except from './except';

import type { Transformer } from '../types';

const transformers: ReadonlyArray<Transformer> = [except, rules, functions, _extends, formats];

export default transformers;
