import { namedTypes, builders as b } from 'ast-types';
import * as path from '@stoplight/path';
import * as astring from 'astring';
import { MigrationOptions } from '../types';
import { commonjs } from './commonjs';
import { esm } from './esm';
import { IModule } from './types';
import requireResolve from '../requireResolve';

export class Scope extends Set<string> {}

export class Tree {
  readonly #importDeclarations = new Map<
    string,
    { imported: namedTypes.Identifier; local: namedTypes.Identifier; default: boolean }[]
  >();

  readonly #npmRegistry;
  readonly #module: IModule;
  readonly #cwd: string;

  public ruleset?: namedTypes.ObjectExpression;
  public readonly scope: Scope;

  constructor({
    cwd,
    format,
    npmRegistry,
    scope,
  }: Pick<MigrationOptions, 'format' | 'npmRegistry'> & { cwd: string; scope: Scope }) {
    this.scope = scope;
    this.#cwd = cwd;
    this.#npmRegistry = npmRegistry ?? null;
    this.#module = format === 'commonjs' ? commonjs : esm;
  }

  addImport(specifier: string, source: string, _default = false): namedTypes.Identifier {
    const existingImportDeclaration = this.#importDeclarations.get(source);

    if (existingImportDeclaration === void 0) {
      const identifier = this.identifier(specifier);
      this.#importDeclarations.set(source, [
        { imported: b.identifier(specifier), local: identifier, default: _default },
      ]);
      return identifier;
    } else {
      for (const declaration of existingImportDeclaration) {
        if (declaration.imported.name === specifier) {
          return declaration.local;
        }
      }

      const identifier = this.identifier(specifier);
      existingImportDeclaration.push({ imported: identifier, local: identifier, default: _default });
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
            this.#npmRegistry !== null && !source.startsWith(this.#cwd) ? path.join(this.#npmRegistry, source) : source;

          const nonDefault = identifiers.filter(({ default: _default }) => !_default);

          return [
            ...(nonDefault.length > 0
              ? [
                  this.#module.importDeclaration(
                    nonDefault.map(({ imported, local }) => [imported, local]),
                    resolvedSource,
                  ),
                ]
              : <namedTypes.ImportDeclaration[]>[]),
            ...identifiers
              .filter(({ default: _default }) => _default)
              .flatMap(({ local }) => this.#module.importDefaultDeclaration(local, resolvedSource)),
          ];
        }),
        this.#module.exportDefaultDeclaration(this.ruleset),
        ...this.#module.dependencies,
      ]),
    );
  }

  public identifier(name: string): namedTypes.Identifier {
    let uniqName = name;
    let i = 0;
    while (this.scope.has(uniqName)) {
      uniqName = `${name}_${i++}`;
    }

    this.scope.add(uniqName);

    return b.identifier(uniqName);
  }

  public resolveModule(identifier: string): string {
    return path.isURL(identifier) ? identifier : requireResolve?.(identifier) ?? path.join(this.#cwd, identifier);
  }
}
