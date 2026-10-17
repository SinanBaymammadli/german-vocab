import { useState } from 'react';
import WordModal from '../components/WordModal';

export default function All({ words: allWords, isLearned, markLearned, markNew }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  let words = [...allWords].sort((a, b) => a.german.localeCompare(b.german));
  if (search) {
    const q = search.toLowerCase();
    words = words.filter(w => w.german.toLowerCase().includes(q) || w.english.toLowerCase().includes(q));
  }

  return (
    <div>
      <div className="list-header">
        <input
          className="search-input"
          placeholder="Search all words…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <p className="list-count">{words.length} word{words.length !== 1 ? 's' : ''}</p>

      <div className="word-grid">
        {words.map(word => {
          const learned = isLearned(word.id);
          return (
            <div key={word.id} className="word-card" onClick={() => setModal(word)}>
              <div className="word-card-header">
                <span className="word-card-german">{word.german}</span>
                <span className="word-card-tag">{word.lesson}</span>
              </div>
              <div className={`status-dot ${learned ? 'learned' : 'new'}`} />
            </div>
          );
        })}
      </div>

      {modal && (
        <WordModal
          word={modal}
          isLearned={isLearned}
          onMarkLearned={markLearned}
          onMarkNew={markNew}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
