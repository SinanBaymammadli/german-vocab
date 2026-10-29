const ARTICLES = { m: "der", f: "die", n: "das", pl: "die", "pl.": "die" };
const ARTICLE_WORDS = new Set(["der", "die", "das", "sich"]);

export function displayGerman(word) {
  const g = word.german ?? "";
  const firstToken = g.split(" ")[0].toLowerCase();

  // Already has an article or is a verb/adjective/etc.
  if (ARTICLE_WORDS.has(firstToken)) return g;

  const pos = word.pos ?? "";

  // noun (pl) / noun (pl.) → die
  if (/noun\s*\(pl/i.test(pos)) return `die ${g}`;

  // noun (m/f) / noun (der/die) → der/die
  if (/noun\s*\(m\/f/i.test(pos) || /noun\s*\(der\/die/i.test(pos)) return `der/die ${g}`;

  // noun (m), noun (f), noun (n)
  const posMatch = pos.match(/noun\s*\(([mfn])/i);
  if (!posMatch) return g;

  const article = ARTICLES[posMatch[1].toLowerCase()];
  return article ? `${article} ${g}` : g;
}
