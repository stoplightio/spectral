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

import * as chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import * as table from 'text-table';

import { DiagnosticSeverity, IRange } from '@stoplight/types';
import { IRuleResult } from '../types';
import { Formatter } from './types';
import { getHighestSeverity } from './utils/getHighestSeverity';
import { groupBySeverity } from './utils/groupBySeverity';
import { groupBySource } from './utils/groupBySource';
import { sortResults } from './utils/sortResults';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {number} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}

function formatRange(range?: IRange): string {
  if (!range) return '';

  return ` ${range.start.line + 1}:${range.start.character + 1}`;
}

const SEVERITY_COLORS = {
  [DiagnosticSeverity.Error]: 'red',
  [DiagnosticSeverity.Warning]: 'yellow',
  [DiagnosticSeverity.Information]: 'blue',
  [DiagnosticSeverity.Hint]: 'white',
};

function getColorForSeverity(severity: DiagnosticSeverity) {
  return SEVERITY_COLORS[severity];
}

function getMessageType(severity: DiagnosticSeverity) {
  const color = getColorForSeverity(severity);

  switch (severity) {
    case DiagnosticSeverity.Error:
      return chalk[color]('error');
    case DiagnosticSeverity.Warning:
      return chalk[color]('warning');
    case DiagnosticSeverity.Information:
      return chalk[color]('information');
    default:
      return chalk[color]('hint');
  }
}

// -----------------------------------------------------------------------------
// Public Interface
// -----------------------------------------------------------------------------

export const stylish: Formatter = results => {
  let output = '\n';
  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  let hintCount = 0;
  const summaryColor = getColorForSeverity(getHighestSeverity(results));

  const groupedResults = groupBySource(results);
  Object.keys(groupedResults).map((path, index) => {
    const pathResults = groupedResults[path];

    const {
      [DiagnosticSeverity.Error]: errors,
      [DiagnosticSeverity.Warning]: warnings,
      [DiagnosticSeverity.Information]: infos,
      [DiagnosticSeverity.Hint]: hints,
    } = groupBySeverity(pathResults);

    errorCount += errors.length;
    warningCount += warnings.length;
    infoCount += infos.length;
    hintCount += hints.length;

    output += `${chalk.underline(path)}\n`;

    const pathTableData = sortResults(pathResults).map((result: IRuleResult) => [
      formatRange(result.range),
      getMessageType(result.severity),
      result.code !== undefined ? result.code : '',
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

  const total = errorCount + warningCount + infoCount + hintCount;

  if (total > 0) {
    output += chalk[summaryColor].bold(
      [
        '\u2716 ',
        total,
        pluralize(' problem', total),
        ' (',
        errorCount,
        pluralize(' error', errorCount),
        ', ',
        warningCount,
        pluralize(' warning', warningCount),
        ', ',
        infoCount,
        pluralize(' info', infoCount),
        ', ',
        hintCount,
        pluralize(' hint', hintCount),
        ')\n',
      ].join(''),
    );
  }

  return total > 0 ? output : '';
};
