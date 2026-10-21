import { Spectral, Document } from '@stoplight/spectral-core';
import { Json as JsonParser } from '@stoplight/spectral-parsers';
import schema from '../schema';
import type { ErrorObject } from 'ajv';
import { createAjvInstancesWithNestedCache } from '../schema/ajv';

// Recursive schema: SchemaObject references itself so AJV generates an indirect
// wrapper.validate call — the only interposable indirection after compilation.
const RECURSIVE_SCHEMA: Record<string, unknown> = {
  $id: 'https://example.com/test-oas-like',
  type: 'object',
  definitions: {
    SchemaObject: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        properties: {
          type: 'object',
          additionalProperties: { $ref: '#/definitions/SchemaObject' },
        },
      },
      additionalProperties: false,
    },
  },
  properties: {
    components: {
      type: 'object',
      properties: {
        schemas: {
          type: 'object',
          additionalProperties: { $ref: '#/definitions/SchemaObject' },
        },
      },
    },
  },
};

function prepareResults(errors: ErrorObject[]): void {
  for (const e of errors) {
    if (e.keyword === 'additionalProperties') {
      e.instancePath = `${e.instancePath}/${String(e.params.additionalProperty)}`;
    }
  }
}

async function run(rawDoc: string, useCache: boolean): Promise<Array<{ path: (string | number)[]; message: string }>> {
  const s = new Spectral();
  s.setRuleset({
    rules: {
      r: {
        message: '{{error}}',
        severity: 1,
        resolved: true,
        given: ['$'],
        then: {
          function: schema,
          functionOptions: {
            schema: RECURSIVE_SCHEMA,
            allErrors: true,
            prepareResults,
            nestedResultCache: useCache,
          },
        },
      },
    },
  });
  const results = await s.run(new Document(rawDoc, JsonParser));
  return results
    .filter(r => r.code === 'r')
    .map(r => ({ path: r.path, message: r.message }))
    .sort((a, b) => {
      const pa = a.path.join('/');
      const pb = b.path.join('/');
      return pa < pb ? -1 : pa > pb ? 1 : 0;
    });
}

function key(r: { path: (string | number)[]; message: string }): string {
  return `${r.path.join('/')}||${r.message}`;
}

function sharedDoc(n: number, k: number, invalid: boolean): string {
  const schemas: Record<string, unknown> = {
    Shared: {
      type: 'object',
      ...(invalid ? { extra: 'INVALID' } : {}),
      properties: Object.fromEntries(
        Array.from({ length: k }, (_, j) => [`prop${j}`, { $ref: `#/components/schemas/Nested${j}` }]),
      ),
    },
  };
  for (let j = 0; j < k; j++) {
    schemas[`Nested${j}`] = invalid ? { type: 'string', extra: 'INVALID_NESTED' } : { type: 'string' };
  }
  for (let i = 0; i < n; i++) {
    schemas[`use${i}`] = { $ref: '#/components/schemas/Shared' };
  }
  return JSON.stringify({ components: { schemas } });
}

describe('schema function / nestedResultCache option', () => {
  it('produces errors at each use-site path for shared invalid nested objects', async () => {
    const raw = sharedDoc(3, 2, true);
    const results = await run(raw, true);
    expect(results.length).toBeGreaterThan(0);
    expect(results.map(r => r.path[0])).toContain('components');
  });

  it('produces no errors for shared valid objects', async () => {
    const raw = sharedDoc(3, 2, false);
    expect(await run(raw, true)).toHaveLength(0);
  });

  it('matches baseline diagnostics for shared invalid nested objects', async () => {
    const raw = sharedDoc(5, 3, true);
    const baseline = await run(raw, false);
    const cached = await run(raw, true);
    expect(cached.map(key)).toEqual(baseline.map(key));
  });

  it('matches baseline diagnostics for shared valid objects', async () => {
    const raw = sharedDoc(5, 3, false);
    expect(await run(raw, true)).toEqual(await run(raw, false));
  });

  it('calls prepareResults once per outer schemaFn invocation', async () => {
    let callCount = 0;
    const trackingPrepare = (errors: ErrorObject[]) => {
      callCount++;
      prepareResults(errors);
    };
    const raw = sharedDoc(3, 1, true);
    const s = new Spectral();
    s.setRuleset({
      rules: {
        r: {
          message: '{{error}}',
          severity: 1,
          resolved: true,
          given: ['$'],
          then: {
            function: schema,
            functionOptions: {
              schema: RECURSIVE_SCHEMA,
              allErrors: true,
              prepareResults: trackingPrepare,
              nestedResultCache: true,
            },
          },
        },
      },
    });
    await s.run(new Document(raw, JsonParser));
    expect(callCount).toBe(1);
  });

  it('isolates prepareResults mutations from cached raw errors across independent runs', async () => {
    const raw = sharedDoc(3, 2, true);
    const r1 = await run(raw, true);
    const r2 = await run(raw, true);
    expect(r2.map(key)).toEqual(r1.map(key));
  });

  it('validates structurally identical but non-shared objects independently', async () => {
    const distinctDoc = JSON.stringify({
      components: {
        schemas: {
          a: { type: 'object', extra: 'INVALID' },
          b: { type: 'object', extra: 'INVALID' },
          c: { type: 'object' },
        },
      },
    });
    const baseline = await run(distinctDoc, false);
    const cached = await run(distinctDoc, true);
    expect(cached.map(key)).toEqual(baseline.map(key));
    const paths = cached.map(r => r.path[2]);
    expect(paths).toContain('a');
    expect(paths).toContain('b');
    expect(paths).not.toContain('c');
  });

  it('validates correctly when two rules use nestedResultCache with different schemas', async () => {
    const raw = sharedDoc(2, 1, true);
    const s = new Spectral();
    s.setRuleset({
      rules: {
        'rule-a': {
          message: '{{error}}',
          severity: 1,
          resolved: true,
          given: ['$'],
          then: {
            function: schema,
            functionOptions: { schema: RECURSIVE_SCHEMA, allErrors: true, prepareResults, nestedResultCache: true },
          },
        },
        'rule-b': {
          message: '{{error}}',
          severity: 1,
          resolved: true,
          given: ['$'],
          then: {
            function: schema,
            functionOptions: { schema: { type: 'object' }, allErrors: true, nestedResultCache: true },
          },
        },
      },
    });
    const results = await s.run(new Document(raw, JsonParser));
    expect(results.filter(r => r.code === 'rule-a').length).toBeGreaterThan(0);
    expect(results.filter(r => r.code === 'rule-b')).toHaveLength(0);
  });

  it('resets the nested cache between independent spectral.run() calls', async () => {
    const s = new Spectral();
    s.setRuleset({
      rules: {
        r: {
          message: '{{error}}',
          severity: 1,
          resolved: true,
          given: ['$'],
          then: {
            function: schema,
            functionOptions: { schema: RECURSIVE_SCHEMA, allErrors: true, prepareResults, nestedResultCache: true },
          },
        },
      },
    });
    const r1 = (await s.run(new Document(sharedDoc(3, 2, true), JsonParser))).filter(r => r.code === 'r');
    const r2 = (await s.run(new Document(sharedDoc(3, 2, false), JsonParser))).filter(r => r.code === 'r');
    expect(r1.length).toBeGreaterThan(0);
    expect(r2).toHaveLength(0);
  });

  it('produces correct paths for property names containing slashes', async () => {
    const raw = JSON.stringify({
      components: {
        schemas: { 'my/schema': { $ref: '#/components/schemas/Item' }, Item: { type: 'object', extra: 'INVALID' } },
      },
    });
    expect((await run(raw, true)).map(key)).toEqual((await run(raw, false)).map(key));
  });

  it('defaults to no caching when nestedResultCache is not set', async () => {
    const raw = sharedDoc(3, 2, true);
    const baseline = await run(raw, false);
    const s = new Spectral();
    s.setRuleset({
      rules: {
        r: {
          message: '{{error}}',
          severity: 1,
          resolved: true,
          given: ['$'],
          then: { function: schema, functionOptions: { schema: RECURSIVE_SCHEMA, allErrors: true, prepareResults } },
        },
      },
    });
    const results = (await s.run(new Document(raw, JsonParser)))
      .filter(r => r.code === 'r')
      .map(r => ({ path: r.path, message: r.message }))
      .sort((a, b) => (a.path.join('/') < b.path.join('/') ? -1 : 1));
    expect(results.map(key)).toEqual(baseline.map(key));
  });

  // ajv-errors wraps sub-validator errors in params.errors with absolute instancePaths.
  // On a cache hit every level of the error tree must be rebased by the call-site prefix.
  it('rebases params.errors instancePaths on cache hit', () => {
    const recursiveSchema = {
      $id: 'https://test.com/rebase-params',
      type: 'object',
      definitions: {
        SchemaObject: {
          type: 'object',
          properties: {
            type: { type: 'string', errorMessage: { type: 'type must be string' } },
            properties: { type: 'object', additionalProperties: { $ref: '#/definitions/SchemaObject' } },
          },
          additionalProperties: false,
        },
      },
      properties: {
        components: {
          type: 'object',
          properties: { schemas: { type: 'object', additionalProperties: { $ref: '#/definitions/SchemaObject' } } },
        },
      },
    };

    const assign = createAjvInstancesWithNestedCache();
    const vf = assign(recursiveSchema, 'auto', true);

    const refs =
      (vf as unknown as { schemaEnv?: { refs?: Record<string, { validate?: unknown }> } }).schemaEnv?.refs ?? {};
    const subKey = Object.keys(refs).find(k => k.includes('SchemaObject'));
    if (!subKey || typeof refs[subKey]?.validate !== 'function') return;

    const sharedObj = { type: 42 };
    expect(vf({ components: { schemas: { first: sharedObj, second: sharedObj } } })).toBe(false);

    const errors = vf.errors ?? [];
    expect(errors.length).toBeGreaterThan(0);

    for (const e of errors) {
      for (const ne of (e.params as { errors?: ErrorObject[] })?.errors ?? []) {
        expect(ne.instancePath).toMatch(new RegExp(`^${e.instancePath.replace(/[/]/g, '\\/')}`));
      }
    }

    const secondOuter = errors.filter(e => e.instancePath.startsWith('/components/schemas/second'));
    expect(secondOuter.length).toBeGreaterThan(0);
    for (const e of secondOuter) {
      for (const ne of (e.params as { errors?: ErrorObject[] })?.errors ?? []) {
        expect(ne.instancePath).toContain('/components/schemas/second');
        expect(ne.instancePath).not.toContain('/components/schemas/first');
      }
    }
  });

  // params of two use-sites in the same call must not share the same object reference.
  it('two use-sites in the same call have independent mutable params', () => {
    const assign = createAjvInstancesWithNestedCache();
    const vf = assign(RECURSIVE_SCHEMA, 'auto', true);

    const refs =
      (vf as unknown as { schemaEnv?: { refs?: Record<string, { validate?: unknown }> } }).schemaEnv?.refs ?? {};
    if (!Object.keys(refs).find(k => k.includes('SchemaObject'))) return;

    const sharedInvalid = { type: 'ok', extra: 'INVALID' };
    vf({ components: { schemas: { a: sharedInvalid, b: sharedInvalid } } });
    const errors = vf.errors ?? [];
    expect(errors.length).toBeGreaterThan(0);

    const errA = errors.find(e => e.instancePath.includes('/a/') || e.instancePath.includes('/a'));
    const errB = errors.find(e => e.instancePath.includes('/b/') || e.instancePath.includes('/b'));
    expect(errA).toBeDefined();
    expect(errB).toBeDefined();

    const origB = (errB!.params as Record<string, unknown>).additionalProperty;
    (errA!.params as Record<string, unknown>).additionalProperty = '__MUTATED__';
    expect((errB!.params as Record<string, unknown>).additionalProperty).toBe(origB);

    vf({ components: { schemas: { a: sharedInvalid, b: sharedInvalid } } });
    for (const e of vf.errors ?? []) {
      const p = (e.params as Record<string, unknown>).additionalProperty;
      if (p !== undefined) expect(p).not.toBe('__MUTATED__');
    }
  });

  // Two root validators that share the same compiled recursive subEnv (via a common
  // pre-registered $id) must each reset all slots before their invocation so neither
  // can serve a stale result from the other's prior call.
  it('shared recursive subEnv: each root resets all slots independently', () => {
    const assign = createAjvInstancesWithNestedCache();

    const nodeSchema = {
      $id: 'https://test.com/shared-node',
      type: 'object',
      properties: { val: { type: 'number' }, child: { $ref: 'https://test.com/shared-node' } },
      additionalProperties: false,
    };
    const schemaA = {
      $id: 'https://test.com/shared-root-a',
      type: 'object',
      properties: { x: { $ref: 'https://test.com/shared-node' } },
    };
    const schemaB = {
      $id: 'https://test.com/shared-root-b',
      type: 'object',
      properties: { y: { $ref: 'https://test.com/shared-node' } },
    };

    assign(nodeSchema, 'auto', true);
    const wrappedA = assign(schemaA, 'auto', true);
    const wrappedB = assign(schemaB, 'auto', true);

    type WithEnv = { schemaEnv?: { refs?: Record<string, unknown> } };
    const refsA = (wrappedA as unknown as WithEnv).schemaEnv?.refs ?? {};
    const refsB = (wrappedB as unknown as WithEnv).schemaEnv?.refs ?? {};
    const kA = Object.keys(refsA).find(k => k.includes('shared-node'));
    const kB = Object.keys(refsB).find(k => k.includes('shared-node'));
    if (!kA || !kB || refsA[kA] !== refsB[kB]) return;

    const sharedChild: Record<string, unknown> = { val: 2 };
    expect(wrappedB({ y: { val: 3, child: sharedChild } })).toBe(true);
    sharedChild.extra = 'INVALID';
    expect(wrappedA({ x: { val: 1, child: sharedChild } })).toBe(false);
    expect((wrappedA.errors ?? []).length).toBeGreaterThan(0);

    delete sharedChild.extra;
    const sc2: Record<string, unknown> = { val: 4 };
    expect(wrappedA({ x: { val: 5, child: sc2 } })).toBe(true);
    sc2.extra = 'INVALID';
    expect(wrappedB({ y: { val: 6, child: sc2 } })).toBe(false);

    const sc3: Record<string, unknown> = { val: 7 };
    expect(wrappedA({ x: { val: 0, child: sc3 } })).toBe(true);
    sc3.extra = 'BAD';
    expect(wrappedB({ y: { val: 0, child: sc3 } })).toBe(false);
    delete sc3.extra;
    expect(wrappedA({ x: { val: 0, child: sc3 } })).toBe(true);
  });

  it.each([
    ['draft2019-09', { $schema: 'https://json-schema.org/draft/2019-09/schema' }],
    ['draft2020-12', { $schema: 'https://json-schema.org/draft/2020-12/schema' }],
  ] as const)('nestedResultCache falls back to standard validation for %s (explicit)', async (dialect, header) => {
    const modernSchema = {
      ...header,
      type: 'object',
      properties: { name: { type: 'string' } },
      unevaluatedProperties: false,
    };
    const s = new Spectral();
    s.setRuleset({
      rules: {
        r: {
          message: '{{error}}',
          severity: 1,
          resolved: true,
          given: ['$'],
          then: {
            function: schema,
            functionOptions: { schema: modernSchema, dialect, allErrors: true, nestedResultCache: true },
          },
        },
      },
    });
    expect(
      (await s.run(new Document(JSON.stringify({ name: 'ok' }), JsonParser))).filter(r => r.code === 'r'),
    ).toHaveLength(0);
    expect(
      (await s.run(new Document(JSON.stringify({ name: 'ok', extra: 'bad' }), JsonParser))).filter(r => r.code === 'r')
        .length,
    ).toBeGreaterThan(0);
  });

  it('nestedResultCache falls back for auto-detected draft2019-09 schema', async () => {
    const modernSchema = {
      $schema: 'https://json-schema.org/draft/2019-09/schema',
      type: 'object',
      properties: { name: { type: 'string' } },
      unevaluatedProperties: false,
    };
    const s = new Spectral();
    s.setRuleset({
      rules: {
        r: {
          message: '{{error}}',
          severity: 1,
          resolved: true,
          given: ['$'],
          then: {
            function: schema,
            functionOptions: { schema: modernSchema, dialect: 'auto', allErrors: true, nestedResultCache: true },
          },
        },
      },
    });
    expect(
      (await s.run(new Document(JSON.stringify({ name: 'ok', extra: 'bad' }), JsonParser))).filter(r => r.code === 'r')
        .length,
    ).toBeGreaterThan(0);
  });
});
