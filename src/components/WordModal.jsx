import { speakGerman } from '../lib/tts';

export default function WordModal({ word, isLearned, onMarkLearned, onMarkNew, onClose }) {
  const learned = isLearned(word.id);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-german">{word.german}</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="speak-btn" onClick={() => speakGerman(word.german)}>🔊</button>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <span className="modal-tag">{word.lesson}</span>
        <div className="modal-english">{word.english}</div>
        <div className="modal-pos">{word.pos}</div>
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
