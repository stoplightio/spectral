import { IResolveResult, IResolveError } from '@stoplight/json-ref-resolver/types';

export type ResolveResult = Omit<IResolveResult, 'runner'>;

export type ResolveError = IResolveError;
