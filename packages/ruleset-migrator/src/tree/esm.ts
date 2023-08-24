import { builders as b, namedTypes } from 'ast-types';
import type * as K from 'ast-types/gen/kinds';
import type { IModule } from './types';

export const esm = <IModule>{
  dependencies: new Set(),

  importDeclaration(
    identifiers: [namedTypes.Identifier, namedTypes.Identifier][],
    source: string,
  ): namedTypes.ImportDeclaration {
    return b.importDeclaration(
      identifiers.map(([imported, local]) => b.importSpecifier(imported, local)),
      b.literal(source),
    );
  },

  importDefaultDeclaration(identifier: namedTypes.Identifier, source: string): namedTypes.ImportDeclaration {
    return b.importDeclaration([b.importDefaultSpecifier(identifier)], b.literal(source));
  },

  exportDefaultDeclaration(value: K.DeclarationKind | K.ExpressionKind): namedTypes.ExportDefaultDeclaration {
    return b.exportDefaultDeclaration(value);
  },
};
