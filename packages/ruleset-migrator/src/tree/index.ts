import { namedTypes, builders as b } from 'ast-types';
import * as path from '@stoplight/path';
import * as astring from 'astring';
import { MigrationOptions, TransformerCtx } from '../types';
import { commonjs } from './commonjs';
import { esm } from './esm';
import { IModule } from './types';
import requireResolve from '../requireResolve';
import { Scope } from './scope';
import { isPackageImport } from '../utils/isPackageImport';
import { isKnownNpmRegistry } from '../utils/isKnownNpmRegistry';

export { Scope };

type ImportDefinition = { imported: namedTypes.Identifier; local: namedTypes.Identifier; default: boolean };

function sortImports([sourceA]: [string, ImportDefinition[]], [sourceB]: [string, ImportDefinition[]]): number {
  if (sourceA.startsWith('@stoplight/')) {
    return sourceB.startsWith('@stoplight/') ? sourceA.localeCompare(sourceB) : -1;
  } else if (sourceB.startsWith('@stoplight/')) {
    return 1;
  }

  return sourceA.localeCompare(sourceB);
}

function sortMembers({ imported: importedA }: ImportDefinition, { imported: importedB }: ImportDefinition): number {
  return importedA.name.localeCompare(importedB.name);
}

export class Tree {
  readonly #importDeclarations = new Map<string, ImportDefinition[]>();

  readonly #npmRegistry;
  readonly #module: IModule;
  readonly #resolvedPaths = new Set<string>();

  public ruleset?: namedTypes.ObjectExpression;
  public scope: Scope;

  constructor({ format, npmRegistry, scope }: Pick<MigrationOptions, 'format' | 'npmRegistry'> & { scope: Scope }) {
    this.scope = scope;
    this.#npmRegistry = npmRegistry ?? null;
    this.#module = format === 'commonjs' ? commonjs : esm;
    if (format === 'commonjs' && this.#npmRegistry !== null) {
      throw new Error(`'npmRegistry' option must not be used with commonjs output format.`);
    }
  }

  addImport(specifier: string, source: string, _default = false): namedTypes.Identifier {
    const existingImportDeclaration = this.#importDeclarations.get(source);

    const scope = source.startsWith('@stoplight/') ? this.scope.global : this.scope;

    if (existingImportDeclaration === void 0) {
      const identifier = Tree.identifier(specifier, scope);
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

      const identifier = Tree.identifier(specifier, scope);
      existingImportDeclaration.push({ imported: b.identifier(specifier), local: identifier, default: _default });
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
        ...Array.from(this.#importDeclarations.entries())
          .sort(sortImports)
          .flatMap(([source, identifiers]) => {
            const resolvedSource =
              this.#npmRegistry !== null && !this.#resolvedPaths.has(source) && !source.startsWith(this.#npmRegistry)
                ? path.join(this.#npmRegistry, source)
                : source;

            const nonDefault = identifiers.filter(({ default: _default }) => !_default).sort(sortMembers);

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

  public static identifier(name: string, scope: Scope): namedTypes.Identifier {
    const baseName = name.replace(/[^$_0-9A-Za-z]/g, '').replace(/^([0-9])/, '_$1');
    let uniqName = baseName;
    let i = 0;
    while (scope.has(uniqName)) {
      uniqName = `${baseName}$${i++}`;
    }

    scope.add(uniqName);

    return b.identifier(uniqName);
  }

  public resolveModule(identifier: string, ctx: TransformerCtx, kind: 'function' | 'ruleset'): string {
    let resolved: string;
    if (path.isURL(identifier) || path.isAbsolute(identifier)) {
      resolved = identifier;
      this.#resolvedPaths.add(identifier);
    } else if (
      (ctx.npmRegistry !== null && ctx.filepath.startsWith(ctx.npmRegistry)) ||
      isKnownNpmRegistry(ctx.filepath)
    ) {
      // npm repos need a different resolution
      // they should have the following pattern
      // <origin>/<pkg-name>
      // <origin>/<pkg-name>/<asset> where asset can be a custom fn, etc.
      resolved = path.join(ctx.filepath, identifier);
    } else if (kind === 'ruleset' && !path.isURL(ctx.filepath) && isPackageImport(identifier)) {
      resolved =
        ctx.npmRegistry !== null
          ? path.join(ctx.npmRegistry, identifier)
          : requireResolve?.(identifier, { paths: [ctx.cwd] }) ?? path.join(ctx.cwd, identifier);
    } else {
      resolved = path.join(ctx.filepath, '..', identifier);
      this.#resolvedPaths.add(resolved);
    }

    return resolved;
  }

  public fork(): Tree {
    const scope = this.scope.fork();
    return new Proxy(this, {
      get: (target, prop): Tree[keyof Tree] => {
        if (prop === 'scope') {
          return scope;
        }

        const value = Reflect.get(target, prop, target) as Tree[keyof Tree];
        if (typeof value === 'function') {
          return value.bind(target);
        }

        return value;
      },
    });
  }
}
