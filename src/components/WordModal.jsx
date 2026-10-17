import { speakGerman } from '../lib/tts';
import { displayGerman } from '../lib/german';
import { getVerbForms } from '../lib/verbForms';

const AUX = { h: 'haben', s: 'sein', 'h/s': 'haben/sein' };

export default function WordModal({ word, isLearned, onMarkLearned, onMarkNew, onClose }) {
  const learned = isLearned(word.id);
  const verbForms = getVerbForms(word);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-german">{displayGerman(word)}</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="speak-btn" onClick={() => speakGerman(word.german)}>🔊</button>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <span className={`modal-tag level-${word.level ?? 'B1'}`}>{word.level ?? 'B1'}</span>
        <div className="modal-english">{word.english}</div>
        <div className="modal-pos">{word.pos}</div>
        {verbForms && (
          <div className="verb-forms">
            <span className="verb-form-item"><span className="vf-label">Prät.</span> {verbForms[0]}</span>
            <span className="verb-form-sep">·</span>
            <span className="verb-form-item"><span className="vf-label">Perfekt</span> {AUX[verbForms[2]] ?? 'hat'} {verbForms[1]}</span>
          </div>
        )}
        <div className="modal-sentences">
          <h4>Example Sentences</h4>
          {word.sentences.map((s, i) => (
            <div key={i} className="modal-sentence">
              <div className="de">{s.de}</div>
              <div className="en">{s.en}</div>
            </div>
          ))}
        </div>
        <div className="modal-status">
          <span>Status: <strong>{learned ? 'learned' : 'new'}</strong></span>
          {learned
            ? <button className="mark-btn ask-again-modal" onClick={() => { onMarkNew(word.id); onClose(); }}>Ask me again</button>
            : <button className="mark-btn learned" onClick={() => { onMarkLearned(word.id); onClose(); }}>Mark as learned</button>
          }
        </div>
      </div>
    </div>
  );
}
