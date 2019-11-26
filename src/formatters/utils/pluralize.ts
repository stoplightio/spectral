/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {number} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
export function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}
