// Progress — delegates to firebase.js (local + optional cloud sync)
function loadProgress() { return loadLocalProgress(); }
function saveProgress(p) { saveLocalProgress(p); }

function getStatus(score) {
  return (score && score >= 3) ? 'learned' : 'new';
}
function isLearned(wordId) {
  return (loadProgress()[wordId]?.score || 0) >= 3;
}
function markNew(wordId) {
  const p = loadProgress();
  delete p[wordId];
  saveProgress(p);
}

// ── Text-to-Speech ────────────────────────────────────────────────────────────
let _voices = [];
function _loadVoices() { _voices = window.speechSynthesis?.getVoices() || []; }
if (window.speechSynthesis) {
  window.speechSynthesis.addEventListener('voiceschanged', _loadVoices);
  _loadVoices();
}

function speakGerman(text) {
  if (!text || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'de-DE';
  utter.rate = 0.85;
  const voice = _voices.find(v => v.lang === 'de-DE') || _voices.find(v => v.lang.startsWith('de'));
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = ['learn', 'learned', 'all'];

function showTab(tab) {
  if (!TABS.includes(tab)) tab = 'learn';
  TABS.forEach(t => {
    document.getElementById(`view-${t}`).style.display = tab === t ? 'block' : 'none';
    document.getElementById(`tab-${t}`).classList.toggle('active', tab === t);
  });
  location.hash = tab;
  if (tab === 'learned') renderLearned();
  if (tab === 'all') renderAll();
}

// Restore tab from hash on load
(function() {
  const hash = location.hash.replace('#', '');
  if (TABS.includes(hash)) showTab(hash);
  window.addEventListener('hashchange', () => {
    const h = location.hash.replace('#', '');
    if (TABS.includes(h)) showTab(h);
  });
})();

// ── Home quiz ─────────────────────────────────────────────────────────────────
function renderHome() {
  const progress = loadProgress();
  const total = WORDS_DATA.length;
  const learned = WORDS_DATA.filter(w => isLearned(w.id)).length;
  const pct = Math.round((learned / total) * 100);

  document.getElementById('home-progress-bar').style.width = pct + '%';
  document.getElementById('home-progress-label').textContent = `${learned} / ${total} words learned (${pct}%)`;

  const newWords = WORDS_DATA.filter(w => !isLearned(w.id));

  if (newWords.length === 0) {
    document.getElementById('home-quiz-card').style.display = 'none';
    document.getElementById('home-all-done').style.display = 'block';
    return;
  }

  document.getElementById('home-quiz-card').style.display = 'block';
  document.getElementById('home-all-done').style.display = 'none';

  const word = newWords[Math.floor(Math.random() * newWords.length)];

  document.getElementById('home-quiz-word').textContent = word.german;
  document.getElementById('home-speak-btn').onclick = () => speakGerman(word.german);
  document.getElementById('home-quiz-feedback').style.display = 'none';
  document.getElementById('home-reveal-btn').style.display = 'block';
  document.getElementById('home-reveal-btn').onclick = () => {
    document.getElementById('home-reveal-btn').style.display = 'none';
    document.querySelectorAll('#home-quiz-choices .choice-btn').forEach(b => b.disabled = true);
    // Highlight correct answer
    document.querySelectorAll('#home-quiz-choices .choice-btn').forEach(b => {
      if (b.textContent === word.english) b.classList.add('correct');
    });
    document.getElementById('home-feedback-text').innerHTML = `<strong>${word.german}</strong> = ${word.english}`;
    document.getElementById('home-feedback-text').className = 'home-feedback-text';
    document.getElementById('home-feedback-sentences').innerHTML = word.sentences.map(s =>
      `<div class="home-sentence"><div class="de">${s.de}</div><div class="en">${s.en}</div></div>`
    ).join('');
    document.getElementById('home-quiz-feedback').style.display = 'block';
    document.getElementById('home-skip-learned-btn').style.display = 'none';
    document.getElementById('home-next-btn').onclick = renderHome;
  };

  speakGerman(word.german);

  const others = shuffle(WORDS_DATA.filter(w => w.id !== word.id)).slice(0, 3);
  const choices = shuffle([...others, word]);

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

  document.getElementById('home-reveal-btn').style.display = 'none';
  const skipBtn = document.getElementById('home-skip-learned-btn');

  if (isCorrect) {
    btn.classList.add('correct');
    const p = loadProgress();
    p[word.id] = { score: 3, lastReviewed: Date.now() };
    saveProgress(p);
    document.getElementById('home-feedback-text').innerHTML = `✓ Correct! <strong>${word.german}</strong> = ${word.english}`;
    document.getElementById('home-feedback-text').className = 'home-feedback-text correct-fb';
    // Show "Ask me again" to undo accidental correct answer
    skipBtn.style.display = 'inline-flex';
    skipBtn.onclick = () => {
      const p = loadProgress();
      delete p[word.id];
      saveProgress(p);
      renderHome();
    };
  } else {
    btn.classList.add('wrong');
    document.querySelectorAll('#home-quiz-choices .choice-btn').forEach(b => {
      if (b.textContent === word.english) b.classList.add('correct');
    });
    document.getElementById('home-feedback-text').innerHTML = `✗ It was: <strong>${word.german}</strong> = ${word.english}`;
    document.getElementById('home-feedback-text').className = 'home-feedback-text wrong-fb';
    skipBtn.style.display = 'none';
  }

  document.getElementById('home-feedback-sentences').innerHTML = word.sentences.map(s =>
    `<div class="home-sentence"><div class="de">${s.de}</div><div class="en">${s.en}</div></div>`
  ).join('');

  document.getElementById('home-quiz-feedback').style.display = 'block';
  document.getElementById('home-next-btn').onclick = renderHome;
}

// ── Learned words list ────────────────────────────────────────────────────────
function renderLearned() {
  const progress = loadProgress();
  const search = (document.getElementById('learned-search')?.value || '').toLowerCase();
  let words = WORDS_DATA.filter(w => isLearned(w.id));
  if (search) words = words.filter(w => w.german.toLowerCase().includes(search) || w.english.toLowerCase().includes(search));
  words.sort((a, b) => (progress[b.id]?.lastReviewed || 0) - (progress[a.id]?.lastReviewed || 0));

  document.getElementById('learned-count').textContent = `${words.length} learned word${words.length !== 1 ? 's' : ''}`;

  const grid = document.getElementById('learned-grid');
  grid.innerHTML = '';
  if (words.length === 0) {
    grid.innerHTML = `<p class="empty-msg">${search ? 'No matches.' : 'No learned words yet — go learn some!'}</p>`;
    return;
  }
  words.forEach(word => {
    const card = document.createElement('div');
    card.className = 'word-card';
    card.innerHTML = `
      <div class="word-card-header">
        <span class="word-card-german">${word.german}</span>
        <button class="ask-again-btn" title="Ask me again">↩</button>
      </div>
      <div class="word-card-english">${word.english}</div>
    `;
    card.querySelector('.ask-again-btn').addEventListener('click', e => {
      e.stopPropagation();
      markNew(word.id);
      renderLearned();
    });
    card.addEventListener('click', () => openWordModal(word));
    grid.appendChild(card);
  });
}

document.getElementById('learned-search').addEventListener('input', renderLearned);

function renderAll() {
  const progress = loadProgress();
  const search = (document.getElementById('all-search')?.value || '').toLowerCase();
  let words = [...WORDS_DATA];
  if (search) words = words.filter(w => w.german.toLowerCase().includes(search) || w.english.toLowerCase().includes(search));
  words.sort((a, b) => a.german.localeCompare(b.german));

  document.getElementById('all-count').textContent = `${words.length} word${words.length !== 1 ? 's' : ''}`;

  const grid = document.getElementById('all-grid');
  grid.innerHTML = '';
  words.forEach(word => {
    const s = getStatus(progress[word.id]?.score || 0);
    const card = document.createElement('div');
    card.className = 'word-card';
    card.innerHTML = `
      <div class="word-card-header">
        <span class="word-card-german">${word.german}</span>
        <span class="word-card-tag">${word.lesson}</span>
      </div>
      <div class="word-card-english">${word.english}</div>
      <div class="word-status-dot ${s}"></div>
    `;
    card.addEventListener('click', () => openWordModal(word));
    grid.appendChild(card);
  });
}

document.getElementById('all-search').addEventListener('input', renderAll);

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
        ${status === 'new'
          ? `<button class="mark-btn learned" data-action="learn">Mark as learned</button>`
          : `<button class="mark-btn ask-again-modal" data-action="new">Ask me again</button>`}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#modal-close-btn').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  overlay.querySelectorAll('.mark-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.action === 'learn') {
        const p = loadProgress();
        p[word.id] = { score: 3, lastReviewed: Date.now() };
        saveProgress(p);
      } else {
        markNew(word.id);
      }
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
