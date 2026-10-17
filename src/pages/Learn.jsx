import { useState, useCallback, useEffect, useRef } from 'react';
import { speakGerman } from '../lib/tts';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWord(words, isLearned) {
  const pool = words.filter(w => !isLearned(w.id));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildChoices(words, word) {
  const others = shuffle(words.filter(w => w.id !== word.id)).slice(0, 3);
  return shuffle([...others, word]);
}

export default function Learn({ words, isLearned, markLearned, markNew, reset }) {
  const total = words.length;
  const learnedCount = words.filter(w => isLearned(w.id)).length;
  const pct = Math.round((learnedCount / total) * 100);

  const [word, setWord] = useState(() => pickWord(words, isLearned));
  const [choices, setChoices] = useState(() => word ? buildChoices(words, word) : []);
  const [phase, setPhase] = useState('word'); // 'word' | 'quiz' | 'feedback'
  const [result, setResult] = useState(null);

  // Re-pick when the word list changes (e.g. B2 finishes loading)
  const prevWordsRef = useRef(words);
  useEffect(() => {
    if (prevWordsRef.current !== words) {
      prevWordsRef.current = words;
      const w = pickWord(words, isLearned);
      setWord(w);
      setChoices(w ? buildChoices(words, w) : []);
      setPhase('word');
      setResult(null);
    }
  }, [words]);

  const nextWord = useCallback(() => {
    const w = pickWord(words, isLearned);
    setWord(w);
    setChoices(w ? buildChoices(words, w) : []);
    setPhase('word');
    setResult(null);
  }, [isLearned]);

  if (!word) {
    return (
      <div className="all-done">
        <div className="all-done-icon">🎉</div>
        <h2>All words learned!</h2>
        <p>You've gone through all new words.</p>
        <button className="btn secondary" onClick={reset}>Reset progress</button>
      </div>
    );
  }

  function handleChoice(chosen) {
    const wasCorrect = chosen.id === word.id;
    if (wasCorrect) markLearned(word.id);
    setResult({ chosen, wasCorrect });
    setPhase('feedback');
  }

  function handleReveal() {
    setPhase('feedback');
    setResult({ chosen: null, wasCorrect: false });
  }

  return (
    <div>
      <div className="progress-wrap">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="progress-label">{learnedCount} / {total} words learned ({pct}%)</p>

      <div className="quiz-card">
        <div className="word-row">
          <span className="quiz-word">{word.german}</span>
          <button className="speak-btn" onClick={() => speakGerman(word.german)}>🔊</button>
        </div>

        {phase === 'word' && (
          <div className="word-phase-actions">
            <button className="btn primary show-options-btn" onClick={() => setPhase('quiz')}>
              Show options
            </button>
            <button className="reveal-link" onClick={handleReveal}>Don't know? Reveal</button>
          </div>
        )}

        {(phase === 'quiz' || phase === 'feedback') && (
          <>
            <div className="choices">
              {choices.map(c => {
                let cls = 'choice-btn';
                if (phase === 'feedback') {
                  if (c.id === word.id) cls += ' correct';
                  else if (result?.chosen?.id === c.id) cls += ' wrong';
                }
                return (
                  <button
                    key={c.id}
                    className={cls}
                    disabled={phase === 'feedback'}
                    onClick={() => handleChoice(c)}
                  >
                    {c.english}
                  </button>
                );
              })}
            </div>
            {phase === 'quiz' && (
              <button className="reveal-link" onClick={handleReveal}>Don't know? Reveal</button>
            )}
          </>
        )}

        {phase === 'feedback' && (
          <div className="feedback">
            <p className={`feedback-text ${result?.wasCorrect ? 'correct-fb' : result?.chosen ? 'wrong-fb' : ''}`}>
              {result?.wasCorrect
                ? <>✓ Correct! <strong>{word.german}</strong> = {word.english}</>
                : result?.chosen
                  ? <>✗ It was: <strong>{word.german}</strong> = {word.english}</>
                  : <><strong>{word.german}</strong> = {word.english}</>
              }
            </p>
            <div className="sentences">
              {word.sentences.map((s, i) => (
                <div key={i} className="sentence">
                  <div className="de">{s.de}</div>
                  <div className="en">{s.en}</div>
                </div>
              ))}
            </div>
            <div className="feedback-actions">
              <button className="btn primary" onClick={nextWord}>Next →</button>
              {result?.wasCorrect && (
                <button className="btn secondary" onClick={() => { markNew(word.id); nextWord(); }}>
                  Ask me again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
