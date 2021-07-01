import { namedTypes, builders as b } from 'ast-types';
import * as path from '@stoplight/path';
import * as astring from 'astring';
import { MigrationOptions } from '../types';
import { commonjs } from './commonjs';
import { esm } from './esm';
import { IModule } from './types';

export class Tree {
  readonly #importDeclarations = new Map<string, { identifier: namedTypes.Identifier; default: boolean }[]>();

  readonly #npmRegistry;
  readonly #module: IModule;

  constructor({ format, npmRegistry }: Pick<MigrationOptions, 'format' | 'npmRegistry'>) {
    this.#npmRegistry = npmRegistry ?? null;
    this.#module = format === 'commonjs' ? commonjs : esm;
  }

  public ruleset?: namedTypes.ObjectExpression;

  addImport(specifier: string, source: string, _default = false): namedTypes.Identifier {
    const existingImportDeclaration = this.#importDeclarations.get(source);

    if (existingImportDeclaration === void 0) {
      const identifier = b.identifier(specifier);
      this.#importDeclarations.set(source, [{ identifier, default: _default }]);
      return identifier;
    } else {
      for (const { identifier } of existingImportDeclaration) {
        if (identifier.name === specifier) {
          return identifier;
        }
      }

      const identifier = b.identifier(specifier);
      existingImportDeclaration.push({ identifier, default: _default });
      return identifier;
    }
  }

  public toString(): string {
    if (this.ruleset === void 0) {
      throw new ReferenceError('Ruleset not assigned');
    }

    this.#module.dependencies.clear();

    return astring.generate(
      b.program([
        ...Array.from(this.#importDeclarations.entries()).flatMap(([source, identifiers]) => {
          const resolvedSource =
            this.#npmRegistry !== null && !source.startsWith('./') ? path.join(this.#npmRegistry, source) : source;

          const nonDefault = identifiers.filter(({ default: _default }) => !_default);

          return [
            ...(nonDefault.length > 0
              ? [
                  this.#module.importDeclaration(
                    nonDefault.map(({ identifier }) => identifier),
                    resolvedSource,
                  ),
                ]
              : <namedTypes.ImportDeclaration[]>[]),
            ...identifiers
              .filter(({ default: _default }) => _default)
              .flatMap(({ identifier }) => this.#module.importDefaultDeclaration(identifier, resolvedSource)),
          ];
        }),
        this.#module.exportDefaultDeclaration(this.ruleset),
        ...this.#module.dependencies,
      ]),
    );
  }
}
