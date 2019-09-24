/**
 * Copyright JS Foundation and other contributors, https://js.foundation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @fileoverview jUnit Reporter
 * @author Jamund Ferguson
 */

import { extname } from '@stoplight/path';
import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import { escapeRegExp } from 'lodash';
import { IRuleResult, SpectralDiagnosticSeverity } from '../types';
import { Formatter } from './types';
import { groupBySource } from './utils/groupBySource';
import { xmlEscape } from './utils/xmlEscape';

const SEVERITY_MAP: Dictionary<string, SpectralDiagnosticSeverity> = {
  [DiagnosticSeverity.Error]: 'Error',
  [DiagnosticSeverity.Warning]: 'Warning',
  [DiagnosticSeverity.Hint]: 'Hint',
  [DiagnosticSeverity.Information]: 'Information',
  [-1]: 'off',
};

function getMessageType(result: IRuleResult) {
  return SEVERITY_MAP[result.severity];
}

export const junit: Formatter = results => {
  let output = '';

  output += '<?xml version="1.0" encoding="utf-8"?>\n';
  output += '<testsuites>\n';

  const groupedResults = groupBySource(results);

  for (const [source, validationResults] of Object.entries(groupedResults)) {
    const classname = source.replace(new RegExp(`${escapeRegExp(extname(source))}$`), '');

    if (validationResults.length > 0) {
      output += `<testsuite package="org.spectral" time="0" tests="${validationResults.length}" errors="${
        validationResults.length
      }" name="${source}">\n`;

      for (const result of validationResults) {
        const tag = getMessageType(result).toLowerCase();
        output += `<testcase time="0" name="org.spectral.${result.code || 'unknown'}" classname="${classname}">`;
        output += `<${tag} message="${xmlEscape(result.message)}">`;
        output += '<![CDATA[';
        output += `line ${result.range.start.line + 1}, col `;
        output += `${result.range.start.character + 1}, ${getMessageType(result)}`;
        output += ` - ${xmlEscape(result.message)}`;
        output += ` (${result.code})`;
        output += ']]>';
        output += `</${tag}>`;
        output += '</testcase>\n';
      }

      output += '</testsuite>\n';
    } else {
      output += `<testsuite package="org.spectral" time="0" tests="1" errors="0" name="${source}">\n`;
      output += `<testcase time="0" name="${source}" classname="${classname}" />\n`;
      output += '</testsuite>\n';
    }
  }

  output += '</testsuites>\n';

  return output;
};
