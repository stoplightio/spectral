import { isBasicRuleset } from '../isBasicRuleset';

describe('isBasicRuleset util', () => {
  it.concurrent.each(['json', 'yaml', 'yml'])('given %s extension, should return true', async ext => {
    const fetch = jest.fn();
    await expect(isBasicRuleset(`/ruleset.${ext}`, fetch)).resolves.toBe(true);
    expect(fetch).not.toBeCalled();
  });

  it.concurrent.each(['js', 'mjs', 'cjs'])('given %s extension, should return false', async ext => {
    const fetch = jest.fn();
    await expect(isBasicRuleset(`/ruleset.${ext}`, fetch)).resolves.toBe(false);
    expect(fetch).not.toBeCalled();
  });

  it.concurrent('given an URL with query, should strip query prior to the lookup', async () => {
    const fetch = jest.fn();
    await expect(isBasicRuleset(`https://stoplight.io/ruleset.yaml?token=test`, fetch)).resolves.toBe(true);
    expect(fetch).not.toBeCalled();
  });

  it.concurrent.each([
    'application/json',
    'application/yaml',
    'text/json',
    'text/yaml',
    'application/yaml; charset=utf-8',
    'application/json; charset=utf-8',
    'text/yaml; charset=utf-16',
  ])('given %s Content-Type, should return true', async input => {
    const fetch = jest.fn().mockResolvedValue({
      headers: new Map([['Content-Type', input]]),
    });

    await expect(isBasicRuleset('https://stoplight.io', fetch)).resolves.toBe(true);
  });

  it.concurrent.each(['application/javascript', 'application/x-yaml', 'application/yaml-', 'something/yaml'])(
    'given %s Content-Type, should return false',
    async input => {
      const fetch = jest.fn().mockResolvedValue({
        headers: new Map([['Content-Type', input]]),
      });

      await expect(isBasicRuleset('https://stoplight.io', fetch)).resolves.toBe(false);
    },
  );

  it.concurrent('given fetch failure, should return false', async () => {
    const fetch = jest.fn().mockRejectedValueOnce(new Error());

    await expect(isBasicRuleset('https://stoplight.io', fetch)).resolves.toBe(false);
  });
});
