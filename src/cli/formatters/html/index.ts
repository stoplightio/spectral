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
 * @fileoverview HTML reporter
 * @author Julian Laval
 */
import * as path from '@stoplight/path';
import { Dictionary } from '@stoplight/types';
import * as eol from 'eol';
import * as fs from 'fs';
import { template } from 'lodash';
import { IRuleResult } from '../../../types';
import { Formatter } from '../types';
import { getHighestSeverity, getSeverityName, getSummary, getSummaryForSource, groupBySource } from '../utils';

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

const pageTemplate = template(eol.lf(fs.readFileSync(path.join(__dirname, 'html-template-page.html'), 'utf8')));
const messageTemplate = template(eol.lf(fs.readFileSync(path.join(__dirname, 'html-template-message.html'), 'utf8')));
const resultTemplate = template(eol.lf(fs.readFileSync(path.join(__dirname, 'html-template-result.html'), 'utf8')));

function renderMessages(messages: IRuleResult[], parentIndex: number) {
  return messages
    .map(message => {
      const line = message.range.start.line + 1;
      const character = message.range.start.character + 1;

      return messageTemplate({
        parentIndex,
        line,
        character,
        severity: getSeverityName(message.severity),
        message: message.message,
        code: message.code,
      });
    })
    .join('\n');
}

function renderResults(groupedResults: Dictionary<IRuleResult[]>) {
  return Object.keys(groupedResults)
    .map(
      (source, index) =>
        resultTemplate({
          index,
          color:
            groupedResults[source].length === 0
              ? 'success'
              : getSeverityName(getHighestSeverity(groupedResults[source])),
          filePath: source,
          summary: getSummaryForSource(groupedResults[source]),
        }) + renderMessages(groupedResults[source], index),
    )
    .join('\n');
}

// ------------------------------------------------------------------------------
// Public Interface
// ------------------------------------------------------------------------------

export const html: Formatter = results => {
  const color = results.length === 0 ? 'success' : getSeverityName(getHighestSeverity(results));
  const groupedResults = groupBySource(results);

  return pageTemplate({
    date: new Date(),
    color,
    summary: getSummary(groupedResults),
    results: renderResults(groupedResults),
  });
};
