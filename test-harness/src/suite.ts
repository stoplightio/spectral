import { applyReplacements, spawnNode, normalizeLineEndings } from '@stoplight/spectral-test-harness';
import { test, expect } from '@jest/globals';
import escapeRegExp from 'lodash/escapeRegExp';
import type { IScenarioFile } from './parser';

declare const scenario: IScenarioFile;

if (scenario.command === null) {
  test.todo(scenario.test);
} else {
  test(scenario.test, async () => {
    const stdout = scenario.stdout;
    const stderr = scenario.stderr;
    const status = scenario.status;
    const env = scenario.env;

    const output = await spawnNode(scenario.command!, env, scenario.path);

    // executing Date() before or after spawnNode were constantly leading to occasional mismatches,
    // as the success of that approach was highly bound to the time spent on the actual spawnNode call
    // this is a tad smarter, because instead of naively hoping the date will match, we try to extract the date from the actual output
    // this regular expression matches "00:43:59" in "Thu Jul 08 2021 00:43:59 GMT+0200 (Central European Summer Time)"
    const date = RegExp(escapeRegExp(String(Date())).replace(/(\d\d:){2}\d\d/, '(\\d\\d:){2}\\d\\d'));
    Reflect.defineProperty(env, 'date', {
      configurable: true,
      enumerable: true,
      get(): string {
        return output.stdout.match(date)?.[0] ?? Date();
      },
    });

    if (stderr !== null) {
      expect(output.stderr).toEqual(normalizeLineEndings(applyReplacements(stderr, env)));
    } else if (output.stderr !== '') {
      throw new Error(output.stderr);
    }

    if (stdout !== null) {
      expect(output.stdout).toEqual(normalizeLineEndings(applyReplacements(stdout, env)));
    }

    if (status !== null) {
      expect(`status:${status}`).toEqual(`status:${Number.parseInt(status)}`);
    }
  });
}
