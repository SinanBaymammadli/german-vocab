import WORDS_B1 from './words';

// B2 is loaded lazily — only imported when the user selects B2
let _b2 = null;
async function loadB2() {
  if (!_b2) {
    const mod = await import('./words-b2');
    _b2 = mod.default;
  }
  return _b2;
}

export function getWords(levels) {
  const set = new Set(levels ?? ['B1']);
  if (set.has('B1') && !set.has('B2')) return WORDS_B1;
  // B2 only or both — handled async via getWordsAsync
  return WORDS_B1; // fallback while B2 loads
}

export async function getWordsAsync(levels) {
  const set = new Set(levels ?? ['B1']);
  if (!set.has('B2')) return WORDS_B1;
  const b2 = await loadB2();
  if (set.has('B1')) return [...WORDS_B1, ...b2];
  return b2;
}
