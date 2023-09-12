import { parseUrlVariables } from '../parseUrlVariables';

describe('parseUrlVariables', () => {
  test('should return all variables from string', () => {
    const result = parseUrlVariables('{stage}.some.{channel}');
    expect(result).toEqual(['stage', 'channel']);
  });

  test('should return empty array if no variable is defined', () => {
    const result = parseUrlVariables('stage.some.channel');
    expect(result).toEqual([]);
  });
});
