const ARTICLES = { m: 'der', f: 'die', n: 'das' };
const ARTICLE_WORDS = new Set(['der', 'die', 'das', 'sich']);

export function displayGerman(word) {
  const g = word.german ?? '';
  const firstToken = g.split(' ')[0].toLowerCase();

  // Already has an article or is a verb/adjective
  if (ARTICLE_WORDS.has(firstToken)) return g;

  // Derive from pos: "noun (m)", "noun (f)", "noun (n)", "noun (m/f)", "noun (pl)"
  const posMatch = word.pos?.match(/noun \(([mfn])/i);
  if (!posMatch) return g;

  const article = ARTICLES[posMatch[1].toLowerCase()];
  return article ? `${article} ${g}` : g;
}
