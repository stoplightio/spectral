/* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return */
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

import { ISpectralDiagnostic } from '@stoplight/spectral-core';
import type { IRange } from '@stoplight/types';
import { DiagnosticSeverity } from '@stoplight/types';
import chalk from 'chalk';
import stripAnsi = require('strip-ansi');
import table from 'text-table';
import { printPath, PrintStyle } from '@stoplight/spectral-runtime';
import type { IRuleResult } from '@stoplight/spectral-core';

import type { Formatter, FormatterOptions } from './types';
import {
  getColorForSeverity,
  getHighestSeverity,
  getSummary,
  getSeverityName,
  groupBySource,
  getScoringText,
  getCountsBySeverity,
  uniqueErrors,
} from './utils';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function formatRange(range?: IRange): string {
  if (range === void 0) return '';

  return ` ${range.start.line + 1}:${range.start.character + 1}`;
}

function getMessageType(severity: DiagnosticSeverity): string {
  const color = getColorForSeverity(severity);
  const name = getSeverityName(severity);

  return chalk[color](name);
}

// -----------------------------------------------------------------------------
// Public Interface
// -----------------------------------------------------------------------------

export const stylish: Formatter = (results: ISpectralDiagnostic[], options: FormatterOptions) => {
  let output = '\n';

  const uniqueResults = uniqueErrors(results);
  const groupedResults = groupBySource(results);
  const summaryColor = getColorForSeverity(getHighestSeverity(uniqueResults));
  const summaryText = getSummary(groupedResults);

  let groupedUniqueResults = { ...groupedResults };
  let scoringColor = '';
  let scoringText = null;

  if (options.scoringConfig !== void 0) {
    if (options.scoringConfig.uniqueErrors) {
      groupedUniqueResults = { ...groupBySource(uniqueResults) };
    }
    scoringColor = getColorForSeverity(DiagnosticSeverity.Information);
    scoringText = getScoringText(getCountsBySeverity(groupedUniqueResults), options.scoringConfig);
  }

  Object.keys(groupedResults).map(path => {
    const pathResults = groupedResults[path];

    output += `${chalk.underline(path)}\n`;

    const pathTableData = pathResults.map((result: IRuleResult) => [
      formatRange(result.range),
      getMessageType(result.severity),
      result.code ?? '',
      result.message,
      printPath(result.path, PrintStyle.Dot),
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
  if (options.scoringConfig !== void 0) {
    output += chalk[scoringColor].bold(`\u2716${scoringText !== null ? ` ${scoringText}` : ''}\n`);
    const scoring = +(scoringText !== null ? scoringText.replace('%', '').split(/[()]+/)[1] : 0);
    if (scoring >= options.scoringConfig.threshold) {
      output += chalk['green'].bold(`\u2716 PASSED!\n`);
    } else {
      output += chalk['red'].bold(`\u2716 NOT PASSED!\n`);
    }
  }

  return output;
};
