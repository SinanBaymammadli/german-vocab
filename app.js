// Progress — delegates to firebase.js (local + optional cloud sync)
function loadProgress() { return loadLocalProgress(); }
function saveProgress(p) { saveLocalProgress(p); }

function getStatus(score) {
  if (!score || score === 0) return 'new';
  if (score <= 2) return 'learning';
  return 'mastered';
}

// ── Text-to-Speech ────────────────────────────────────────────────────────────
let _ttsAudio = null;

function speakGerman(text) {
  if (!text) return;
  if (_ttsAudio) { _ttsAudio.pause(); _ttsAudio = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=de&client=tw-ob&ttsspeed=0.9`;
  _ttsAudio = new Audio(url);
  _ttsAudio.play().catch(() => _speakBrowserFallback(text));
}

let _voices = [];
function _loadVoices() { _voices = window.speechSynthesis?.getVoices() || []; }
if (window.speechSynthesis) {
  window.speechSynthesis.addEventListener('voiceschanged', _loadVoices);
  _loadVoices();
}
function _speakBrowserFallback(text) {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'de-DE';
  utter.rate = 0.85;
  const voice = _voices.find(v => v.lang === 'de-DE') || _voices.find(v => v.lang.startsWith('de'));
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
}

// ── Home quiz ─────────────────────────────────────────────────────────────────
function renderHome() {
  const progress = loadProgress();
  const total = WORDS_DATA.length;
  const learned = WORDS_DATA.filter(w => (progress[w.id]?.score || 0) >= 3).length;
  const pct = Math.round((learned / total) * 100);

  document.getElementById('home-progress-bar').style.width = pct + '%';
  document.getElementById('home-progress-label').textContent = `${learned} / ${total} words learned (${pct}%)`;

  const newWords = WORDS_DATA.filter(w => (progress[w.id]?.score || 0) < 3);

  if (newWords.length === 0) {
    document.getElementById('home-quiz-card').style.display = 'none';
    document.getElementById('home-all-done').style.display = 'block';
    return;
  }

  document.getElementById('home-quiz-card').style.display = 'block';
  document.getElementById('home-all-done').style.display = 'none';

  const word = newWords[Math.floor(Math.random() * newWords.length)];

  document.getElementById('home-quiz-lesson').textContent = word.lesson;
  document.getElementById('home-quiz-word').textContent = word.german;
  document.getElementById('home-speak-btn').onclick = () => speakGerman(word.german);
  document.getElementById('home-quiz-feedback').style.display = 'none';

  speakGerman(word.german);

  const others = WORDS_DATA.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3);
  const choices = [...others, word].sort(() => Math.random() - 0.5);

  const container = document.getElementById('home-quiz-choices');
  container.innerHTML = '';
  choices.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = c.english;
    btn.addEventListener('click', () => handleHomeChoice(btn, c.id === word.id, word));
    container.appendChild(btn);
  });
}

function handleHomeChoice(btn, isCorrect, word) {
  document.querySelectorAll('#home-quiz-choices .choice-btn').forEach(b => b.disabled = true);

  if (isCorrect) {
    btn.classList.add('correct');
    const p = loadProgress();
    p[word.id] = { score: 3, lastReviewed: Date.now() };
    saveProgress(p);
    document.getElementById('home-feedback-text').innerHTML = `✓ Correct! <strong>${word.german}</strong> = ${word.english}`;
    document.getElementById('home-feedback-text').className = 'home-feedback-text correct-fb';
  } else {
    btn.classList.add('wrong');
    document.querySelectorAll('#home-quiz-choices .choice-btn').forEach(b => {
      if (b.textContent === word.english) b.classList.add('correct');
    });
    document.getElementById('home-feedback-text').innerHTML = `✗ It was: <strong>${word.german}</strong> = ${word.english}`;
    document.getElementById('home-feedback-text').className = 'home-feedback-text wrong-fb';
  }

  document.getElementById('home-feedback-sentences').innerHTML = word.sentences.map(s =>
    `<div class="home-sentence"><div class="de">${s.de}</div><div class="en">${s.en}</div></div>`
  ).join('');

  document.getElementById('home-quiz-feedback').style.display = 'block';
  document.getElementById('home-next-btn').onclick = renderHome;
}

// ── Word detail modal ─────────────────────────────────────────────────────────
function openWordModal(word) {
  const progress = loadProgress();
  const score = progress[word.id]?.score || 0;
  const status = getStatus(score);

  function closeModal() { overlay.remove(); }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <span class="modal-german">${word.german}</span>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <button class="speak-btn" onclick="speakGerman('${word.german.replace(/'/g,"\\'")}')">🔊</button>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>
      </div>
      <span class="modal-tag">${word.lesson}</span>
      <div class="modal-english">${word.english}</div>
      <div class="modal-pos">${word.pos}</div>
      <div class="modal-sentences">
        <h4>Example Sentences</h4>
        ${word.sentences.map(s => `
          <div class="modal-sentence">
            <div class="de">${s.de}</div>
            <div class="en">${s.en}</div>
          </div>
        `).join('')}
      </div>
      <div class="modal-status">
        <span>Status: <strong>${status}</strong></span>
        <button class="mark-btn learned" data-score="3">Mark as learned</button>
        <button class="mark-btn mastered" data-score="4">Mark as mastered</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#modal-close-btn').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  overlay.querySelectorAll('.mark-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = loadProgress();
      p[word.id] = { score: parseInt(btn.dataset.score), lastReviewed: Date.now() };
      saveProgress(p);
      closeModal();
      renderHome();
    });
  });
}

// ── Reset ─────────────────────────────────────────────────────────────────────
document.getElementById('reset-progress-btn').addEventListener('click', () => {
  if (confirm('Reset all progress? This cannot be undone.')) {
    localStorage.removeItem('b1vocab_progress');
    renderHome();
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────
renderHome();
