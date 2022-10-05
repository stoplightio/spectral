// import only 2.X.X AsyncAPI JSON Schemas for better treeshaking
import * as asyncAPI2_0_0Schema from '@asyncapi/specs/schemas/2.0.0.json';
import * as asyncAPI2_1_0Schema from '@asyncapi/specs/schemas/2.1.0.json';
import * as asyncAPI2_2_0Schema from '@asyncapi/specs/schemas/2.2.0.json';
import * as asyncAPI2_3_0Schema from '@asyncapi/specs/schemas/2.3.0.json';
import * as asyncAPI2_4_0Schema from '@asyncapi/specs/schemas/2.4.0.json';
import * as asyncAPI2_5_0Schema from '@asyncapi/specs/schemas/2.5.0.json';

export type AsyncAPISpecVersion = keyof typeof specs;

export const specs = {
  '2.0.0': asyncAPI2_0_0Schema,
  '2.1.0': asyncAPI2_1_0Schema,
  '2.2.0': asyncAPI2_2_0Schema,
  '2.3.0': asyncAPI2_3_0Schema,
  '2.4.0': asyncAPI2_4_0Schema,
  '2.5.0': asyncAPI2_5_0Schema,
};

const versions = Object.keys(specs);
export const latestVersion = versions[versions.length - 1];

export function getCopyOfSchema(version: AsyncAPISpecVersion): Record<string, unknown> {
  return JSON.parse(JSON.stringify(specs[version])) as Record<string, unknown>;
}
