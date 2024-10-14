/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import allSchemas from '@asyncapi/specs';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const specs = allSchemas.schemas;

export type AsyncAPISpecVersion = keyof typeof specs;

const versions = Object.keys(specs);
export const latestVersion = versions[versions.length - 1];

export function getCopyOfSchema(version: AsyncAPISpecVersion): Record<string, unknown> {
  return JSON.parse(JSON.stringify(specs[version])) as Record<string, unknown>;
}
