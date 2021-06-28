import type { namedTypes } from 'ast-types';
import type { DeclarationKind, ExpressionKind, StatementKind } from 'ast-types/gen/kinds';

export interface IModule {
  dependencies: Set<DeclarationKind>;
  importDeclaration(identifiers: namedTypes.Identifier[], source: string): DeclarationKind;
  importDefaultDeclaration(identifier: namedTypes.Identifier, source: string): DeclarationKind;
  exportDefaultDeclaration(value: ExpressionKind): StatementKind | DeclarationKind;
}
