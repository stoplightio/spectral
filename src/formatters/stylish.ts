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

import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import * as table from 'text-table';

import { DiagnosticSeverity, Dictionary, IRange } from '@stoplight/types';
import { IRuleResult } from '../types';

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

// -----------------------------------------------------------------------------
// Public Interface
// -----------------------------------------------------------------------------

export const stylish = (results: IRuleResult[]): string => {
  let output = '\n';
  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  let summaryColor = 'white';

  const groupedResults = groupBySource(results);
  Object.keys(groupedResults).map((path, index) => {
    const pathResults = groupedResults[path];

    const errors = pathResults.filter((result: IRuleResult) => result.severity === DiagnosticSeverity.Error);
    const warnings = pathResults.filter((result: IRuleResult) => result.severity === DiagnosticSeverity.Warning);
    const infos = pathResults.filter((result: IRuleResult) => result.severity === DiagnosticSeverity.Information);

    errorCount += errors.length;
    warningCount += warnings.length;
    infoCount += infos.length;

    output += `${chalk.underline(path)}\n`;

    const pathTableData = pathResults.map((result: IRuleResult) => {
      let messageType;

      if (result.severity === DiagnosticSeverity.Error) {
        messageType = chalk.red('error');
        summaryColor = 'red';
      } else if (result.severity === DiagnosticSeverity.Warning) {
        messageType = chalk.yellow('warning');
        summaryColor = 'yellow';
      } else {
        messageType = chalk.yellow('white');
      }

      return [
        formatRange(result.range),
        messageType,
        result.code,
        result.summary ? result.summary.replace(/([^ ])\.$/u, '$1') : result.message,
      ];
    });

    output += `${table(pathTableData, {
      align: ['c', 'r', 'l'],
      stringLength(str) {
        return stripAnsi(str).length;
      },
    })
      .split('\n')
      .map((el: string) =>
        el.replace(/(\d+)\s+(\d+)/u, (m: string, p1: string, p2: string) => chalk.dim(`${p1}:${p2}`))
      )
      .join('\n')}\n\n`;
  });

  const total = errorCount + warningCount + infoCount;

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
        ')\n',
      ].join('')
    );
  }

  return total > 0 ? output : '';
};

const groupBySource = (results: IRuleResult[]) => {
  return results.reduce((grouped: Dictionary<IRuleResult[]>, result: IRuleResult) => {
    (grouped[result.source!] = grouped[result.source!] || []).push(result);
    return grouped;
  }, {});
};

export function formatRange(range?: IRange) {
  if (!range) return '';

  return ` ${range.start.line + 1}:${range.start.character + 1}`;
}
