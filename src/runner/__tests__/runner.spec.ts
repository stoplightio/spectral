import { RunnerRuntime } from '../runtime';

describe('Runner Runtime', () => {
  let runtime: RunnerRuntime;

  beforeEach(() => {
    runtime = new RunnerRuntime();
  });

  describe('spawn', () => {
    it('always create a new sub-instance', () => {
      expect(runtime.spawn()).not.toBe(runtime.spawn());
    });

    it('freezes a created sub-instance', () => {
      const instance = runtime.spawn();
      const { on } = instance;

      expect(() => void delete instance.on).toThrow();
      expect(() => void (instance.on = jest.fn())).toThrow();
      // @ts-expect-error
      expect(() => void (instance.off = true)).toThrow();

      expect(instance).toStrictEqual({ on });
    });
  });

  describe('revoke', () => {
    it('revokes all registered sub-instances', () => {
      const instances = [runtime.spawn(), runtime.spawn(), runtime.spawn()];

      runtime.revoke();

      expect(() => instances[0].on).toThrow();
      expect(() => instances[1].on).toThrow();
      expect(() => instances[2].on).toThrow();
    });

    it('is able to revoke at any time', () => {
      runtime.revoke();

      let instance = runtime.spawn();
      expect(() => instance.on).not.toThrow();
      runtime.revoke();
      expect(() => instance.on).toThrow();

      instance = runtime.spawn();
      expect(() => instance.on).not.toThrow();
      runtime.revoke();
      expect(() => instance.on).toThrow();
    });
  });

  describe('events', () => {
    it('emits & receives all relevant events', () => {
      const instance = runtime.spawn();
      const onBeforeTeardown = jest.fn();
      const onAfterTeardown = jest.fn();
      const onSetup = jest.fn();

      instance.on('beforeTeardown', onBeforeTeardown);
      instance.on('afterTeardown', onAfterTeardown);
      instance.on('setup', onSetup);

      runtime.emit('setup');
      runtime.emit('beforeTeardown');
      runtime.emit('afterTeardown');

      expect(onSetup).toBeCalledTimes(1);
      expect(onBeforeTeardown).toBeCalledTimes(1);
      expect(onAfterTeardown).toBeCalledTimes(1);
    });

    it('upon revoke, detaches all handlers', () => {
      const instance = runtime.spawn();
      const handler = jest.fn();

      instance.on('beforeTeardown', handler);

      runtime.emit('beforeTeardown');
      expect(handler).toBeCalledTimes(1);

      runtime.revoke();

      runtime.emit('beforeTeardown');
      expect(handler).toBeCalledTimes(1);
    });
  });
});
