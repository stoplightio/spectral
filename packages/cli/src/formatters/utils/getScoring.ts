import { SEVERITY_MAP } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { ScoringConfig, ScoringTable, ScoringSubtract } from '../types';
import * as path from '@stoplight/path';
import fs from 'fs';

export const getScoringConfig = async (scoringFile?: string): Promise<ScoringConfig | undefined> => {
  if (scoringFile === void 0) {
    return undefined;
  } else if (!path.isAbsolute(scoringFile)) {
    scoringFile = path.join(process.cwd(), scoringFile);
  }

  const scoringConfig: ScoringConfig = JSON.parse(await fs.promises.readFile(scoringFile, 'utf8')) as ScoringConfig;

  return scoringConfig;
};

export const getScoringLevel = (
  issuesCount: {
    [DiagnosticSeverity.Error]: number;
    [DiagnosticSeverity.Warning]: number;
    [DiagnosticSeverity.Information]: number;
    [DiagnosticSeverity.Hint]: number;
  },
  scoringSubtract: ScoringTable[],
  onlySubtractHigherSeverityLevel: boolean,
): number => {
  let scoring = 100;
  Object.keys(issuesCount).forEach(key => {
    const scoringKey = Object.keys(SEVERITY_MAP).filter(mappedKey => SEVERITY_MAP[mappedKey] == key)[0];
    if (scoringSubtract[scoringKey] !== void 0) {
      if (scoring < 100 && !onlySubtractHigherSeverityLevel) return;
      let subtractValue = 0;
      Object.keys(scoringSubtract[scoringKey] as ScoringSubtract[]).forEach((subtractKey: string): void => {
        subtractValue = (
          issuesCount[key] >= subtractKey
            ? (scoringSubtract[scoringKey] as ScoringSubtract[])[subtractKey]
            : subtractValue
        ) as number;
      });
      scoring -= subtractValue;
    }
  });
  return scoring > 0 ? scoring : 0;
};

export const getScoringText = (
  issuesCount: {
    [DiagnosticSeverity.Error]: number;
    [DiagnosticSeverity.Warning]: number;
    [DiagnosticSeverity.Information]: number;
    [DiagnosticSeverity.Hint]: number;
  },
  scoringConfig: ScoringConfig,
): string => {
  const { scoringSubtract, scoringLetter, onlySubtractHigherSeverityLevel } = scoringConfig;
  const scoring = getScoringLevel(issuesCount, scoringSubtract, onlySubtractHigherSeverityLevel);
  let scoringLevel: string = Object.keys(scoringLetter)[Object.keys(scoringLetter).length - 1];
  Object.keys(scoringLetter)
    .reverse()
    .forEach(key => {
      if (scoring > (scoringLetter[key] as number)) {
        scoringLevel = key;
      }
    });
  return `SCORING: ${scoringLevel} (${scoring}%)`;
};
