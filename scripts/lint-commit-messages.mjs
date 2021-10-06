import * as process from 'node:process';
import * as child_process from 'node:child_process';
import { promisify } from 'node:util';
import * as assert from 'ndoe:assert';
import { Octokit } from '@octokit/core';
import chalk from 'chalk';

if (!process.env.CI_PULL_REQUEST) {
  // not a PR
  process.exit(0);
}

const execAsync = promisify(child_process.exec);

const octokit = new Octokit({ auth: process.env.GH_TOKEN });

const PULL_REQUEST_NUMBER = Number(process.env.CI_PULL_REQUEST.slice(process.env.CI_PULL_REQUEST.lastIndexOf('/') + 1));
assert.ok(!Number.isNaN(PULL_REQUEST_NUMBER), `Could not find valid PR Number: ${PULL_REQUEST_NUMBER}`);

const OPTIONS = {
  owner: 'stoplightio',
  repo: 'spectral',
  id: PULL_REQUEST_NUMBER,
};

const pullRequest = await octokit.request('GET /repos/{owner}/{repo}/pulls/{id}', OPTIONS);
assert.ok(pullRequest.status >= 200 && pullRequest.status < 300);

await lint(pullRequest.data.title, 'Your PR title is invalid');

const autoMergeCommitTitle = pullRequest.data.auto_merge?.commit_title;

if (typeof autoMergeCommitTitle === 'string') {
  await lint(pullRequest.data.title, 'Your auto-merge message is invalid');
}

const commits = await octokit.request('GET /repos/{owner}/{repo}/pulls/{id}/commits', OPTIONS);
assert.ok(commits.status >= 200 && commits.status < 300);

for (const { commit } of commits.data) {
  if (commit.parents.length > 1) {
    // possibly a merge commit, carry on
    continue;
  }

  await lint(commit.message);
}

process.stdout.write(chalk.green('✔️ All good. Your commit messages are valid.\n'));

async function lint(title, header) {
  try {
    await execAsync(`echo "${title}" | yarn commitlint`);
  } catch (e) {
    if (header) {
      process.stderr.write(chalk.redBright(`✖   ${header}\n`));
    }

    process.stderr.write(chalk.redBright(e.stdout ?? e.message));
    process.exit(1);
  }
}
