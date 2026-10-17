import { useState } from 'react';
import { pushCustomWord } from '../lib/github';

const POS_OPTIONS = [
  'noun (m)', 'noun (f)', 'noun (n)', 'noun (pl)',
  'verb', 'verb (reflexive)',
  'adjective', 'adverb', 'preposition', 'conjunction', 'phrase',
];

const LEVELS = ['A1', 'A2', 'B1', 'B2'];

const GITHUB_TOKEN_KEY = 'github_pat';

export default function AddWord() {
  const [token, setToken]       = useState(() => localStorage.getItem(GITHUB_TOKEN_KEY) ?? '');
  const [german, setGerman]     = useState('');
  const [english, setEnglish]   = useState('');
  const [pos, setPos]           = useState('noun (m)');
  const [level, setLevel]       = useState('B1');
  const [de1, setDe1]           = useState('');
  const [en1, setEn1]           = useState('');
  const [de2, setDe2]           = useState('');
  const [en2, setEn2]           = useState('');
  const [status, setStatus]     = useState(null); // null | 'loading' | 'ok' | 'error'
  const [errMsg, setErrMsg]     = useState('');

  function saveToken(v) { setToken(v); localStorage.setItem(GITHUB_TOKEN_KEY, v); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) { setStatus('error'); setErrMsg('Enter your GitHub token first.'); return; }
    if (!german || !english) { setStatus('error'); setErrMsg('German and English fields are required.'); return; }

    setStatus('loading');
    const word = {
      german: german.trim(),
      lesson: 'custom',
      level,
      english: english.trim(),
      pos,
      sentences: [
        { de: de1.trim() || `${german.trim()} ist ein wichtiges Wort.`, en: en1.trim() || `${english.trim()} is an important word.` },
        { de: de2.trim() || `Ich lerne das Wort ${german.trim()}.`, en: en2.trim() || `I am learning the word ${english.trim()}.` },
      ],
    };

    try {
      await pushCustomWord(token, word);
      setStatus('ok');
      setGerman(''); setEnglish(''); setDe1(''); setEn1(''); setDe2(''); setEn2('');
    } catch (err) {
      setStatus('error');
      setErrMsg(err.message);
    }
  }

  return (
    <div className="settings-page">
      <h2>Add Word</h2>

      <section className="settings-section">
        <h3>GitHub token</h3>
        <p className="settings-hint">
          Needed to push the word to the repo.{' '}
          <a href="https://github.com/settings/tokens/new?scopes=contents&description=german-vocab" target="_blank" rel="noreferrer" className="link">
            Create one here
          </a>{' '}
          (needs <code>contents: write</code> scope). Stored locally only.
        </p>
        <input
          className="search-input"
          type="password"
          placeholder="ghp_…"
          value={token}
          onChange={e => saveToken(e.target.value)}
        />
      </section>

      <section className="settings-section">
        <h3>Word details</h3>
        <form className="add-word-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>German word *
              <input className="search-input" value={german} onChange={e => setGerman(e.target.value)} placeholder="e.g. der Schmetterling" />
            </label>
            <label>English meaning *
              <input className="search-input" value={english} onChange={e => setEnglish(e.target.value)} placeholder="butterfly" />
            </label>
          </div>
          <div className="form-row">
            <label>Part of speech
              <select className="search-input" value={pos} onChange={e => setPos(e.target.value)}>
                {POS_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label>Level
              <select className="search-input" value={level} onChange={e => setLevel(e.target.value)}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </label>
          </div>

          <h4 style={{margin:'1rem 0 .5rem', fontSize:'.85rem', color:'var(--muted)'}}>Example sentences (optional)</h4>
          <div className="form-row">
            <label>Sentence 1 (German)
              <input className="search-input" value={de1} onChange={e => setDe1(e.target.value)} placeholder="Der Schmetterling fliegt." />
            </label>
            <label>Sentence 1 (English)
              <input className="search-input" value={en1} onChange={e => setEn1(e.target.value)} placeholder="The butterfly flies." />
            </label>
          </div>
          <div className="form-row">
            <label>Sentence 2 (German)
              <input className="search-input" value={de2} onChange={e => setDe2(e.target.value)} placeholder="Ich sehe einen Schmetterling." />
            </label>
            <label>Sentence 2 (English)
              <input className="search-input" value={en2} onChange={e => setEn2(e.target.value)} placeholder="I see a butterfly." />
            </label>
          </div>

          {status === 'error' && <p className="form-error">{errMsg}</p>}
          {status === 'ok'    && <p className="form-success">✓ Word added! The site will rebuild in ~1 minute.</p>}

          <button className="btn primary" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Pushing…' : 'Add word →'}
          </button>
        </form>
      </section>
    </div>
  );
}
