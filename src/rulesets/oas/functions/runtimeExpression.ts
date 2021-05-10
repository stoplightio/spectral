import { isString } from 'lodash';
import type { IFunction, IFunctionResult } from '../../../types';

export const runtimeExpression: IFunction = function (exp): void | IFunctionResult[] {
  // oas3 spec allows for type Any, so only validate when exp is a string
  if (!isString(exp)) return;
  if (['$url', '$method', '$statusCode'].includes(exp)) {
    // valid expression
    return;
  } else if (exp.startsWith('$request.') || exp.startsWith('$response.')) {
    return validateSource(exp.replace(/^\$(request\.|response\.)/, ''));
  }

  return [
    {
      message: 'expressions must start with one of: `$url`, `$method`, `$statusCode`, `$request.`,`$response.`',
    },
  ];
};

function validateSource(source: string): void | IFunctionResult[] {
  if (source === 'body') {
    // valid expression
    return;
  } else if (source.startsWith('body#')) {
    return validateJsonPointer(source.replace(/^body#/, ''));
  } else if (source.startsWith('query.') || source.startsWith('path.')) {
    return validateName(source.replace(/^(query\.|path\.)/, ''));
  } else if (source.startsWith('header.')) {
    return validateToken(source.replace(/^header\./, ''));
  }

  return [
    {
      message: '`$request.` and `$response.` must be followed by one of: `header.`, `query.`, `body`, `body#`',
    },
  ];
}

function validateJsonPointer(jsonPointer: string): void | IFunctionResult[] {
  if (!jsonPointer.startsWith('/')) {
    return [
      {
        message: '`body#` must be followed by `/`',
      },
    ];
  }
  while (jsonPointer.includes('/')) {
    // remove everything up to and including the first `/`
    jsonPointer = jsonPointer.replace(/[^/]*\//, '');
    // get substring before the next `/`
    const referenceToken: string = jsonPointer.includes('/')
      ? jsonPointer.slice(0, jsonPointer.indexOf('/'))
      : jsonPointer;
    if (!isValidReferenceToken(referenceToken)) {
      return [
        {
          message:
            'string following `body#` is not a valid JSON pointer, see https://spec.openapis.org/oas/v3.1.0#runtime-expressions for more information',
        },
      ];
    }
  }
}

function validateName(name: string): void | IFunctionResult[] {
  // zero or more of characters in the ASCII range 0x01-0x7F
  const validName = /^[\x01-\x7F]*$/;
  if (!validName.test(name)) {
    return [
      {
        message: 'string following `query.` and `path.` must only include ascii characters 0x01-0x7F.',
      },
    ];
  }
}

function validateToken(token: string): void | IFunctionResult[] {
  // one or more of the given tchar characters
  const validTCharString = /^[a-zA-Z0-9!#$%&'*+\-.^_`|~]+$/;
  if (!validTCharString.test(token)) {
    return [
      {
        message: 'must provide valid header name after `header.`',
      },
    ];
  }
}

function isValidReferenceToken(referenceToken: string): boolean {
  return isValidEscaped(referenceToken) || isValidUnescaped(referenceToken);
}

function isValidEscaped(escaped: string): boolean {
  // escaped must be empty/null or match the given pattern
  return !escaped || !!/^~(0|1)$/.exec(escaped);
}

function isValidUnescaped(unescaped: string): boolean {
  // unescaped may be empty/null, expect no `/` and no `~` chars
  return !unescaped || !/(\/|~)/.exec(unescaped);
}
