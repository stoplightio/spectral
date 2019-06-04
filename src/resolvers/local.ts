import { Resolver } from '@stoplight/json-ref-resolver';

// just resolves internal #/definitions/user type $refs
export const localResolver = new Resolver();
