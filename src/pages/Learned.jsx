import { useState, useEffect } from "react";
import WordModal from "../components/WordModal";
import WORDS_B1 from "../data/words-b1";
import { displayGerman } from "../lib/german";
import { getWordsAsync } from "../data/index";

export default function Learned({ isLearned, markLearned, markNew, progress }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [allWords, setAllWords] = useState(WORDS_B1);

  // Always load ALL levels so every learned word shows up here
  useEffect(() => {
    getWordsAsync(["A1", "A2", "B1", "B2"]).then(setAllWords);
  }, []);

  let words = allWords.filter((w) => isLearned(w.id));
  if (search) {
    const q = search.toLowerCase();
    words = words.filter(
      (w) => w.german.toLowerCase().includes(q) || w.english.toLowerCase().includes(q),
    );
  }
  words = [...words].sort(
    (a, b) => (progress[b.id]?.lastReviewed ?? 0) - (progress[a.id]?.lastReviewed ?? 0),
  );

  return (
    <div>
      <div className="list-header">
        <input
          className="search-input"
          placeholder="Search learned words…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <p className="list-count">
        {words.length} learned word{words.length !== 1 ? "s" : ""}
      </p>

      {words.length === 0 ? (
        <p className="empty-msg">{search ? "No matches." : "No learned words yet."}</p>
      ) : (
        <div className="word-grid">
          {words.map((word) => (
            <div key={word.id} className="word-card" onClick={() => setModal(word)}>
              <div className="word-card-header">
                <span className="word-card-german">{displayGerman(word)}</span>
                <div style={{ display: "flex", gap: ".35rem", alignItems: "center" }}>
                  <span className={`word-card-tag level-${word.level ?? "B1"}`}>
                    {word.level ?? "B1"}
                  </span>
                  <button
                    className="ask-again-btn"
                    title="Ask me again"
                    onClick={(e) => {
                      e.stopPropagation();
                      markNew(word.id);
                    }}
                  >
                    ↩
                  </button>
                </div>
              </div>
            </div>
          ))}
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
