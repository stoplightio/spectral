import specs from '@asyncapi/specs';

export type AsyncAPISpecVersion = keyof typeof specs;

const versions = Object.keys(specs);
export const latestVersion = versions[versions.length - 1];

export function getCopyOfSchema(version: AsyncAPISpecVersion): Record<string, unknown> {
  return JSON.parse(JSON.stringify(specs[version])) as Record<string, unknown>;
}
