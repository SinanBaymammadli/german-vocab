import WORDS_B1 from './words';
import WORDS_B2 from './words-b2';

export const ALL_WORDS = [...WORDS_B1, ...WORDS_B2];

export function getWords(levels) {
  if (!levels || levels.length === 0) return WORDS_B1;
  const set = new Set(levels);
  const filtered = ALL_WORDS.filter(w => set.has(w.level ?? 'B1'));
  return filtered.length > 0 ? filtered : WORDS_B1;
}
