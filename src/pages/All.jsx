import { useState } from 'react';
import WordModal from '../components/WordModal';
import { displayGerman } from '../lib/german';

const FILTERS = ['all', 'new', 'seen', 'learned'];

export default function All({ words: allWords, isLearned, isSeen, markLearned, markNew, progress }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);

  const byDate = (a, b) => (progress[b.id]?.lastReviewed ?? 0) - (progress[a.id]?.lastReviewed ?? 0);
  const byName = (a, b) => a.german.localeCompare(b.german);

  let words = [...allWords];
  if (search) {
    const q = search.toLowerCase();
    words = words.filter(w => w.german.toLowerCase().includes(q) || w.english.toLowerCase().includes(q));
  }
  if (filter === 'learned') { words = words.filter(w => isLearned(w.id)).sort(byDate); }
  else if (filter === 'seen') { words = words.filter(w => isSeen(w.id) && !isLearned(w.id)).sort(byDate); }
  else if (filter === 'new') { words = words.filter(w => !isSeen(w.id)).sort(byName); }
  else { words = words.sort(byName); }

  return (
    <div>
      <div className="list-header">
        <input
          className="search-input"
          placeholder="Search all words…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="status-filter">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`filter-btn${filter === f ? ' active' : ''}${f !== 'all' ? ` filter-${f}` : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <p className="list-count">{words.length} word{words.length !== 1 ? 's' : ''}</p>

      {words.length === 0 ? (
        <p className="empty-msg">{search ? 'No matches.' : `No ${filter === 'all' ? '' : filter + ' '}words yet.`}</p>
      ) : (
        <div className="word-grid">
          {words.map(word => {
            const learned = isLearned(word.id);
            const seen = isSeen(word.id);
            return (
              <div key={word.id} className="word-card" onClick={() => setModal(word)}>
                <div className="word-card-header">
                  <span className="word-card-german">{displayGerman(word)}</span>
                  <div style={{ display: 'flex', gap: '.35rem', alignItems: 'center' }}>
                    <span className={`word-card-tag level-${word.level ?? 'B1'}`}>{word.level ?? 'B1'}</span>
                    {learned && (
                      <button
                        className="ask-again-btn"
                        title="Ask me again"
                        onClick={e => { e.stopPropagation(); markNew(word.id); }}
                      >↩</button>
                    )}
                  </div>
                </div>
                <div className={`status-dot ${learned ? 'learned' : seen ? 'seen' : 'new'}`} />
              </div>
            );
          })}
        </div>
      )}

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
