import WORDS_B1 from './words-b1';

let _a1 = null, _a2 = null, _b2 = null;

async function loadA1() {
  if (!_a1) { const m = await import('./words-a1'); _a1 = m.default; }
  return _a1;
}
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
  if (set.has('B1') && set.size === 1) return WORDS_B1;
  return WORDS_B1; // sync fallback
}

// Cache resolved word lists by level key to keep stable references
const _cache = {};

export async function getWordsAsync(levels) {
  const set = new Set(levels ?? ['B1']);
  // B1-only fast path — return the module reference directly
  if (set.has('B1') && set.size === 1) return WORDS_B1;

  const key = [...set].sort().join('+');
  if (_cache[key]) return _cache[key];

  const parts = [];
  if (set.has('A1')) parts.push(await loadA1());
  if (set.has('A2')) parts.push(await loadA2());
  if (set.has('B1')) parts.push(WORDS_B1);
  if (set.has('B2')) parts.push(await loadB2());
  const result = parts.flat();
  _cache[key] = result;
  return result;
}
