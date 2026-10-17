const OWNER = 'SinanBaymammadli';
const REPO  = 'german-vocab';
const FILE  = 'src/data/words-custom.js';

function headers(token) {
  return {
    Authorization: `token ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
  };
}

export async function fetchCustomWords(token) {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`,
    { headers: headers(token) }
  );
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const content = atob(data.content.replace(/\n/g, ''));
  // Parse the JS array from "const WORDS_CUSTOM = [...];"
  const match = content.match(/\[[\s\S]*\]/);
  const words = match ? JSON.parse(match[0]) : [];
  return { words, sha: data.sha };
}

export async function pushCustomWord(token, newWord) {
  const { words, sha } = await fetchCustomWords(token);

  // New ID = max existing ID + 1 (custom words use 10000+ range)
  const maxId = words.reduce((m, w) => Math.max(m, w.id), 9999);
  newWord.id = maxId + 1;
  words.push(newWord);

  const lines = ['const WORDS_CUSTOM = ['];
  words.forEach(w => {
    const s = JSON.stringify(w.sentences);
    lines.push(`  {id:${w.id},german:${JSON.stringify(w.german)},lesson:${JSON.stringify(w.lesson)},level:${JSON.stringify(w.level)},english:${JSON.stringify(w.english)},pos:${JSON.stringify(w.pos)},sentences:${s}},`);
  });
  lines.push('];\nexport default WORDS_CUSTOM;');

  const content = btoa(unescape(encodeURIComponent(lines.join('\n'))));
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`,
    {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify({
        message: `Add custom word: ${newWord.german}`,
        content,
        sha,
      }),
    }
  );
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`);
  return newWord;
}
