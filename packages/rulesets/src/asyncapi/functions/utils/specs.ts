import allSchemas from '@asyncapi/specs';
import type { Format } from '@stoplight/spectral-core';
import {
  aas2_0,
  aas2_1,
  aas2_2,
  aas2_3,
  aas2_4,
  aas2_5,
  aas2_6,
  aas3,
  aas3_0,
  aas3_1,
} from '@stoplight/spectral-formats';
const specs = allSchemas.schemas;

export type AsyncAPISpecVersion = keyof typeof specs;
export type AsyncAPISchemaSelection = Readonly<{
  version: AsyncAPISpecVersion;
  fallback: boolean;
}>;

const versions = Object.keys(specs) as AsyncAPISpecVersion[];
export const latestVersion = versions[versions.length - 1];

const aas3Versions = versions.filter(version => version.startsWith('3.'));
const latestAas3Version = aas3Versions[aas3Versions.length - 1];

const knownVersions: ReadonlyArray<readonly [Format, AsyncAPISpecVersion]> = [
  [aas3_1, '3.1.0'],
  [aas3_0, '3.0.0'],
  [aas2_6, '2.6.0'],
  [aas2_5, '2.5.0'],
  [aas2_4, '2.4.0'],
  [aas2_3, '2.3.0'],
  [aas2_2, '2.2.0'],
  [aas2_1, '2.1.0'],
  [aas2_0, '2.0.0'],
];

export function selectAsyncAPISchema(formats: Set<Format>): AsyncAPISchemaSelection | void {
  for (const [format, version] of knownVersions) {
    if (formats.has(format)) {
      return { version, fallback: false };
    }
  }

  if (formats.has(aas3)) {
    return { version: latestAas3Version, fallback: true };
  }
}

export function getCopyOfSchema(version: AsyncAPISpecVersion): Record<string, unknown> {
  return JSON.parse(JSON.stringify(specs[version])) as Record<string, unknown>;
}
