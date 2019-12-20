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
 * @fileoverview Stylish reporter
 * @author Sindre Sorhus
 */

import { DiagnosticSeverity, IRange } from '@stoplight/types';
import * as chalk from 'chalk';
import stripAnsi = require('strip-ansi');
import * as table from 'text-table';

import { IRuleResult } from '../types';
import { Formatter } from './types';
import { getColorForSeverity, getHighestSeverity, getSeverityName, getSummary, groupBySource } from './utils';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function formatRange(range?: IRange): string {
  if (!range) return '';

  return ` ${range.start.line + 1}:${range.start.character + 1}`;
}

function getMessageType(severity: DiagnosticSeverity) {
  const color = getColorForSeverity(severity);
  const name = getSeverityName(severity);

  return chalk[color](name);
}

// -----------------------------------------------------------------------------
// Public Interface
// -----------------------------------------------------------------------------

export const stylish: Formatter = results => {
  let output = '\n';
  const groupedResults = groupBySource(results);
  const summaryColor = getColorForSeverity(getHighestSeverity(results));
  const summaryText = getSummary(groupedResults);

  Object.keys(groupedResults).map(path => {
    const pathResults = groupedResults[path];

    output += `${chalk.underline(path)}\n`;

    const pathTableData = pathResults.map((result: IRuleResult) => [
      formatRange(result.range),
      getMessageType(result.severity),
      result.code ?? '',
      result.message,
    ]);

    output += `${table(pathTableData, {
      align: ['c', 'r', 'l'],
      stringLength(str) {
        return stripAnsi(str).length;
      },
    })
      .split('\n')
      .map((el: string) =>
        el.replace(/(\d+)\s+(\d+)/u, (m: string, p1: string, p2: string) => chalk.dim(`${p1}:${p2}`)),
      )
      .join('\n')}\n\n`;
  });

  if (summaryText === null) {
    return '';
  }

  output += chalk[summaryColor].bold(`\u2716 ${summaryText}\n`);

  return output;
};
