import { EventEmitter, IDisposable } from '@stoplight/lifecycle';

type Revokable = () => void;

export type SpectralEvents = {
  setup(): void;
  beforeTeardown(): void;
  afterTeardown(): void;
};

export class RunnerRuntime extends EventEmitter<SpectralEvents> {
  protected readonly revokables: Revokable[];

  constructor() {
    super();

    this.revokables = [];
  }

  public persist<O extends object>(obj: O): O {
    const { proxy, revoke } = Proxy.revocable<O>(obj, {});
    this.revokables.push(revoke);
    return proxy;
  }

  public revoke(): void {
    let revokable;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    while ((revokable = this.revokables.shift())) {
      revokable();
    }
  }

  public spawn(): Pick<RunnerRuntime, 'on'> {
    return this.persist(
      Object.freeze({
        // eslint-disable-next-line @typescript-eslint/unbound-method
        on: this.hijackDisposable(this.on),
      }),
    );
  }

  protected hijackDisposable<F extends (...args: any[]) => IDisposable>(fn: F): F {
    return ((...args) => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      this.revokables.push(fn.apply(this, args).dispose);
    }) as F;
  }
}
