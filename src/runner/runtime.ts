import { createEventEmitter, IEventEmitterInstance } from '@stoplight/lifecycle';
import StrictEventEmitter from 'strict-event-emitter-types';

type Revokable = () => void;

export type SpectralEvents = {
  beforeTeardown(): void;
  afterTeardown(): void;
};

export class RunnerRuntime extends createEventEmitter<SpectralEvents>() {
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

  public collect() {
    let revokable;
    // tslint:disable-next-line:no-conditional-assignment
    while ((revokable = this.revokables.shift())) {
      revokable();
    }
  }

  public spawn(): Pick<StrictEventEmitter<IEventEmitterInstance, SpectralEvents>, 'on'> {
    return this.persist({
      on: this.on.bind(this),
    });
  }
}
