import { builders as b, namedTypes } from 'ast-types';
import type * as K from 'ast-types/gen/kinds';
import type { IModule } from './types';

const ex = b.identifier('ex');

const _interopDefault = b.functionDeclaration(
  b.identifier('_interopDefault'),
  [ex],
  b.blockStatement([
    b.returnStatement(
      b.conditionalExpression(
        b.logicalExpression(
          '&&',
          b.logicalExpression(
            '&&',
            ex,
            b.binaryExpression('===', b.unaryExpression('typeof', ex), b.literal('object')),
          ),
          b.binaryExpression('in', b.literal('default'), ex),
        ),
        b.memberExpression(ex, b.literal('default'), true),
        ex,
      ),
    ),
  ]),
);

export const commonjs = <IModule>{
  dependencies: new Set(),

  importDeclaration(
    identifiers: [namedTypes.Identifier, namedTypes.Identifier][],
    source: string,
  ): namedTypes.VariableDeclaration {
    return b.variableDeclaration('const', [
      b.variableDeclarator(
        b.objectPattern(identifiers.map(([imported, local]) => b.property('init', imported, local))),
        b.callExpression(b.identifier('require'), [b.literal(source)]),
      ),
    ]);
  },

  importDefaultDeclaration(identifier: namedTypes.Identifier, source: string): namedTypes.VariableDeclaration {
    this.dependencies.add(_interopDefault);

    return b.variableDeclaration('const', [
      b.variableDeclarator(
        identifier,
        b.callExpression(b.identifier('_interopDefault'), [
          b.callExpression(b.identifier('require'), [b.literal(source)]),
        ]),
      ),
    ]);
  },

  exportDefaultDeclaration(value: K.ExpressionKind): namedTypes.ExpressionStatement {
    return b.expressionStatement(
      b.assignmentExpression('=', b.memberExpression(b.identifier('module'), b.identifier('exports')), value),
    );
  },
};
