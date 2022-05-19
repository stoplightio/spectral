import { createRulesetFunction } from '@stoplight/spectral-core';

import type { IFunctionResult } from '@stoplight/spectral-core';
import { isPlainObject } from '@stoplight/json';

type Scopes = {
  scopes: Record<string, unknown>;
};
type OAuth2Security = {
  implicit?: Scopes;
  password?: Scopes;
  clientCredentials?: Scopes;
  authorizationCode?: Scopes;
};

const OAuth2Keys = ['implicit', 'password', 'clientCredentials', 'authorizationCode'];
function getAllScopes(oauth2: OAuth2Security): string[] {
  const scopes: string[] = [];
  OAuth2Keys.forEach(key => {
    const flow = oauth2[key] as Scopes;
    if (isPlainObject(flow) && isPlainObject(flow)) {
      scopes.push(...Object.keys(flow.scopes));
    }
  });
  return Array.from(new Set(scopes));
}

export default createRulesetFunction<Record<string, string[]>, { objectType: 'Server' | 'Operation' }>(
  {
    input: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
    options: {
      type: 'object',
      properties: {
        objectType: {
          type: 'string',
          enum: ['Server', 'Operation'],
        },
      },
    },
  },
  function asyncApi2Security(targetVal = {}, { objectType }, ctx) {
    const results: IFunctionResult[] = [];
    const spec = ctx.document.data as {
      components: { securitySchemes: Record<string, { type: string; flows?: OAuth2Security }> };
    };
    const securitySchemes = spec?.components?.securitySchemes ?? {};
    const securitySchemesKeys = Object.keys(securitySchemes);

    Object.keys(targetVal).forEach(securityKey => {
      if (!securitySchemesKeys.includes(securityKey)) {
        results.push({
          message: `${objectType} must not reference an undefined security scheme.`,
          path: [...ctx.path, securityKey],
        });
      }

      const securityScheme = securitySchemes[securityKey];
      if (securityScheme?.type === 'oauth2') {
        const availableScopes = getAllScopes(securityScheme.flows ?? {});
        targetVal[securityKey].forEach((securityScope, index) => {
          if (!availableScopes.includes(securityScope)) {
            results.push({
              message: `Non-existing security scope for the specified security scheme. Available: [${availableScopes.join(
                ', ',
              )}]`,
              path: [...ctx.path, securityKey, index],
            });
          }
        });
      }
    });

    return results;
  },
);
