/* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */
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
 * @fileoverview Pretty Reporter
 * @author Ava Thorn
 */

import { IDiagnostic, IRange } from '@stoplight/types';
import * as chalk from 'chalk';

import { Formatter } from './types';
import { getColorForSeverity, getHighestSeverity, getSummary, getSeverityName, groupBySource } from './utils';
import { printPath, PrintStyle } from '../../utils';

function formatRange(range?: IRange): string {
  if (range === void 0) return '';

  return ` ${range.start.line + 1}:${range.start.character + 1}`;
}

export const pretty: Formatter = results => {
  const cliui = require('cliui');
  let output = '\n';
  const DEFAULT_TOTAL_WIDTH = process.stdout.columns;
  const COLUMNS = [10, 13, 25, 20, 20];
  const variableColumns = DEFAULT_TOTAL_WIDTH - COLUMNS.reduce((a, b) => a + b);
  COLUMNS[2] = Math.floor(variableColumns / 3);
  COLUMNS[3] = Math.ceil((variableColumns / 3) * 2);

  const PAD_TOP0_LEFT2 = [0, 0, 0, 2];
  const PAD_TOP1_LEFT0 = [1, 0, 0, 0];
  const ui = cliui({ width: DEFAULT_TOTAL_WIDTH, wrap: true });

  const groupedResults = groupBySource(results);
  const summaryColor = getColorForSeverity(getHighestSeverity(results));
  const summaryText = getSummary(groupedResults);

  const uniqueIssues: IDiagnostic['code'][] = [];
  Object.keys(groupedResults).forEach(i => {
    const pathResults = groupedResults[i];
    ui.div({ text: 'File:   ' + i, padding: PAD_TOP1_LEFT0 });

    pathResults.forEach(result => {
      if (!uniqueIssues.includes(result.code)) {
        uniqueIssues.push(result.code);
      }
      const color = getColorForSeverity(result.severity);
      ui.div(
        { text: chalk[color](formatRange(result.range)), width: COLUMNS[0] },
        {
          text: chalk[color].inverse(getSeverityName(result.severity).toUpperCase()),
          padding: PAD_TOP0_LEFT2,
          width: COLUMNS[1],
        },
        { text: chalk[color].bold(result.code), padding: PAD_TOP0_LEFT2, width: COLUMNS[2] },
        { text: chalk.gray(result.message), padding: PAD_TOP0_LEFT2, width: COLUMNS[3] },
        { text: chalk.cyan(printPath(result.path, PrintStyle.Dot)), padding: PAD_TOP0_LEFT2 },
      );
      ui.div();
    });
  });
  ui.div();

  output += ui.toString();
  output += chalk[summaryColor].bold(`${uniqueIssues.length} Unique Issue(s)\n`);
  output += chalk[summaryColor].bold(`\u2716${summaryText !== null ? ` ${summaryText}` : ''}\n`);

  return output;
};
