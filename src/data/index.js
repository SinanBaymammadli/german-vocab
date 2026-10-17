import WORDS_B1 from './words';

let _a2 = null, _b2 = null;

async function loadA2() {
  if (!_a2) { const m = await import('./words-a2'); _a2 = m.default; }
  return _a2;
}
async function loadB2() {
  if (!_b2) { const m = await import('./words-b2'); _b2 = m.default; }
  return _b2;
}

export function getWords(levels) {
  const set = new Set(levels ?? ['B1']);
  if (set.has('B1') && !set.has('A2') && !set.has('B2')) return WORDS_B1;
  return WORDS_B1; // sync fallback while async loads
}

export async function getWordsAsync(levels) {
  const set = new Set(levels ?? ['B1']);
  const parts = [];
  if (set.has('A2')) parts.push(await loadA2());
  if (set.has('B1')) parts.push(WORDS_B1);
  if (set.has('B2')) parts.push(await loadB2());
  return parts.length ? parts.flat() : WORDS_B1;
}
