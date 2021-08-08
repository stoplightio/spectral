import * as reserved from 'reserved';

const REGISTERED_WORDS = [
  ...reserved,
  'await', // not listed among reserved

  // NodeJS CJS
  'require',
  'module',
  '__dirname',
  '__filename',

  // Our own interop
  '_interopDefault',
];

let i = 0;

export class Scope {
  public readonly id;
  readonly #parentScope: Scope | null;
  readonly #uniqueIdentifiers: Set<string>;
  readonly #aliases: Map<string, string>;

  constructor(parentScope: Scope | null = null) {
    this.id = i++;
    this.#parentScope = parentScope;
    this.#uniqueIdentifiers = parentScope === null ? new Set(REGISTERED_WORDS) : new Set<string>();
    this.#aliases = new Map();
  }

  get global(): Scope {
    return this.#parentScope === null ? this : this.#parentScope.global;
  }

  has(local: string): boolean {
    return this.#parentScope?.has(local) ?? this.#uniqueIdentifiers.has(local);
  }

  add(imported: string): void {
    this.#uniqueIdentifiers.add(imported);
    this.#parentScope?.add(imported);
  }

  store(name: string, imported: string): void {
    this.#aliases.set(name, imported);
  }

  load(name: string): string | undefined {
    return this.#aliases.get(name);
  }

  fork(): Scope {
    return new Scope(this);
  }
}
