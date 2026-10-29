import WORDS from "./words";

export function getWords(levels) {
  if (!levels || levels.length === 0) return WORDS;
  const set = new Set(levels);
  return WORDS.filter((w) => set.has(w.level));
}

export async function getWordsAsync(levels) {
  return getWords(levels);
}
