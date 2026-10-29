import { useState, useCallback } from "react";
import { speakGerman } from "../lib/tts";
import { displayGerman } from "../lib/german";
import { getVerbForms } from "../lib/verbForms";

const AUX = { h: "haben", s: "sein", "h/s": "haben/sein" };

function VerbForms({ word }) {
  const forms = getVerbForms(word);
  if (!forms) return null;
  return (
    <div className="verb-forms" style={{ marginTop: ".6rem" }}>
      <span className="verb-form-item">
        <span className="vf-label">Prät.</span> {forms[0]}
      </span>
      <span className="verb-form-sep">·</span>
      <span className="verb-form-item">
        <span className="vf-label">Perfekt</span> {AUX[forms[2]] ?? "haben"} {forms[1]}
      </span>
    </div>
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWord(words, isLearned) {
  const pool = words.filter((w) => !isLearned(w.id));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildChoices(words, word) {
  const others = shuffle(words.filter((w) => w.id !== word.id)).slice(0, 3);
  return shuffle([...others, word]);
}

export default function Learn({ words, isLearned, isSeen, markLearned, markNew, markSeen, reset }) {
  const total = words.length;
  const learnedCount = words.filter((w) => isLearned(w.id)).length;
  const seenCount = words.filter((w) => isSeen(w.id) && !isLearned(w.id)).length;
  const learnedPct = Math.round((learnedCount / total) * 100);
  const seenPct = Math.round((seenCount / total) * 100);

  const [word, setWord] = useState(() => pickWord(words, isLearned));
  const [choices, setChoices] = useState(() => (word ? buildChoices(words, word) : []));
  const [phase, setPhase] = useState("word"); // 'word' | 'quiz' | 'feedback'
  const [result, setResult] = useState(null);

  const nextWord = useCallback(() => {
    const w = pickWord(words, isLearned);
    setWord(w);
    setChoices(w ? buildChoices(words, w) : []);
    setPhase("word");
    setResult(null);
  }, [isLearned]);

  if (!word) {
    return (
      <div className="all-done">
        <div className="all-done-icon">🎉</div>
        <h2>All words learned!</h2>
        <p>You've gone through all new words.</p>
        <button className="btn secondary" onClick={reset}>
          Reset progress
        </button>
      </div>
    );
  }

  function handleChoice(chosen) {
    const wasCorrect = chosen.id === word.id;
    if (wasCorrect) markLearned(word.id);
    else markSeen(word.id);
    setResult({ chosen, wasCorrect });
    setPhase("feedback");
  }

  function handleReveal() {
    markSeen(word.id);
    setPhase("feedback");
    setResult({ chosen: null, wasCorrect: false });
  }

  return (
    <div>
      <div className="progress-wrap">
        <div
          className="progress-fill progress-seen"
          style={{ width: `${learnedPct + seenPct}%` }}
        />
        <div className="progress-fill" style={{ width: `${learnedPct}%` }} />
      </div>
      <p className="progress-label">
        {learnedCount} learned ({learnedPct}%) · {seenCount} seen ({seenPct}%) · {total} total
      </p>

      <div className="quiz-card">
        <div className="word-row">
          <span className="quiz-word">{displayGerman(word)}</span>
          <button className="speak-btn" onClick={() => speakGerman(word.german)}>
            🔊
          </button>
          <span className={`word-card-tag level-${word.level ?? "B1"}`}>{word.level ?? "B1"}</span>
        </div>

        {phase === "word" && (
          <div className="word-phase-actions">
            <button className="btn primary show-options-btn" onClick={() => setPhase("quiz")}>
              Show options
            </button>
            <button className="reveal-link" onClick={handleReveal}>
              Don't know? Reveal
            </button>
          </div>
        )}

        {(phase === "quiz" || phase === "feedback") && (
          <>
            <div className="choices">
              {choices.map((c) => {
                let cls = "choice-btn";
                if (phase === "feedback") {
                  if (c.id === word.id) cls += " correct";
                  else if (result?.chosen?.id === c.id) cls += " wrong";
                }
                return (
                  <button
                    key={c.id}
                    className={cls}
                    disabled={phase === "feedback"}
                    onClick={() => handleChoice(c)}
                  >
                    {c.english}
                  </button>
                );
              })}
            </div>
            {phase === "quiz" && (
              <button className="reveal-link" onClick={handleReveal}>
                Don't know? Reveal
              </button>
            )}
          </>
        )}

        {phase === "feedback" && (
          <div className="feedback">
            <p
              className={`feedback-text ${result?.wasCorrect ? "correct-fb" : result?.chosen ? "wrong-fb" : ""}`}
            >
              {result?.wasCorrect ? (
                <>
                  ✓ Correct! <strong>{displayGerman(word)}</strong> = {word.english}
                </>
              ) : result?.chosen ? (
                <>
                  ✗ It was: <strong>{displayGerman(word)}</strong> = {word.english}
                </>
              ) : (
                <>
                  <strong>{displayGerman(word)}</strong> = {word.english}
                </>
              )}
            </p>
            <VerbForms word={word} />
            <div className="sentences">
              {word.sentences.map((s, i) => (
                <div key={i} className="sentence">
                  <div className="de">{s.de}</div>
                  <div className="en">{s.en}</div>
                </div>
              ))}
            </div>
            <div className="feedback-actions">
              <button className="btn primary" onClick={nextWord}>
                Next →
              </button>
              {result?.wasCorrect && (
                <button
                  className="btn secondary"
                  onClick={() => {
                    markNew(word.id);
                    nextWord();
                  }}
                >
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
