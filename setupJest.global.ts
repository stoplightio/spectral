import { isNimmaEnvVariableSet } from './src/utils/isNimmaEnvVariableSet';

export default function () {
  console.info(`Nimma rule optimizer activated: ${isNimmaEnvVariableSet()}`);
}
