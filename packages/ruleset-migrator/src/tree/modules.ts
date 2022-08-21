import type { GlobalModules, MigrationOptions } from '../types';
import { TransformerCtx } from '../types';
import * as path from '@stoplight/path';
import { isPackageImport } from '../utils/isPackageImport';
import requireResolve from '../requireResolve';
import { isKnownNpmRegistry } from '../utils/isKnownNpmRegistry';

export class Modules {
  readonly #resolvedPaths = new Set<string>();
  readonly #npmRegistry: string | null;

  constructor(public modules: GlobalModules, npmRegistry: MigrationOptions['npmRegistry']) {
    this.#npmRegistry = npmRegistry ?? null;
  }

  public isResolved(source: string): boolean {
    return this.#resolvedPaths.has(source);
  }

  public listStaticModules(kind: 'ruleset' | 'function' | 'format'): string[] {
    return Object.keys(this.modules[`${kind}s`] ?? {});
  }

  public resolveStaticModule(kind: 'ruleset' | 'function' | 'format', specifier: string): string | null {
    const availableModules = this.modules[`${kind}s`];

    if (availableModules === null) {
      return null;
    }

    const resolvedModules = Object.entries(availableModules).filter(([, module]) => specifier in module);
    if (resolvedModules.length > 1) {
      throw Error(`"${specifier}" resolves to more than a single module`);
    }

    return resolvedModules.length === 0 ? null : resolvedModules[0][0];
  }

  public resolveModule(kind: 'function' | 'ruleset', ctx: TransformerCtx, identifier: string): string {
    let resolved: string;
    if (path.isURL(identifier) || path.isAbsolute(identifier)) {
      resolved = identifier;
      this.#resolvedPaths.add(identifier);
    } else if (kind === 'ruleset' && isPackageImport(identifier)) {
      resolved =
        this.#npmRegistry !== null
          ? path.join(this.#npmRegistry, identifier)
          : requireResolve?.(identifier, { paths: [ctx.cwd] }) ?? path.join(ctx.cwd, identifier);
    } else if (
      (this.#npmRegistry !== null && ctx.filepath.startsWith(this.#npmRegistry)) ||
      isKnownNpmRegistry(ctx.filepath)
    ) {
      // npm repos need a different resolution
      // they should have the following pattern
      // <origin>/<pkg-name>
      // <origin>/<pkg-name>/<asset> where asset can be a custom fn, etc.
      resolved = path.join(ctx.filepath, identifier);
    } else {
      resolved = path.join(ctx.filepath, '..', identifier);
      this.#resolvedPaths.add(resolved);
    }

    return resolved;
  }
}
