// Progress — delegates to firebase.js (which handles local + optional cloud sync)
const STATS_KEY = 'b1vocab_stats';

function loadProgress() { return loadLocalProgress(); }
function saveProgress(p) { saveLocalProgress(p); }
function loadStats() {
  try { return JSON.parse(localStorage.getItem(STATS_KEY)) || { quizzes: 0, cardsReviewed: 0, correctAnswers: 0, totalAnswers: 0 }; } catch { return { quizzes: 0, cardsReviewed: 0, correctAnswers: 0, totalAnswers: 0 }; }
}
function saveStats(s) { localStorage.setItem(STATS_KEY, JSON.stringify(s)); }

// score: 0=new, 1=again, 2=hard, 3=good, 4=easy(mastered)
function getStatus(score) {
  if (!score || score === 0) return 'new';
  if (score <= 2) return 'learning';
  return 'mastered';
}

// ── Navigation ──────────────────────────────────────────────────────────────
const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.nav-btn');

function showView(name) {
  views.forEach(v => v.classList.toggle('active', v.id === `view-${name}`));
  navBtns.forEach(b => b.classList.toggle('active', b.dataset.view === name));
  if (name === 'home') renderHome();
  if (name === 'flashcards') initFlashcards();
  if (name === 'browse') renderBrowse();
  if (name === 'stats') renderStats();
}

navBtns.forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));

// ── Lessons ──────────────────────────────────────────────────────────────────
function getLessons() {
  const lessons = [...new Set(WORDS_DATA.map(w => w.lesson))].sort((a, b) => {
    const n1 = parseInt(a.replace('L', ''));
    const n2 = parseInt(b.replace('L', ''));
    return n1 - n2;
  });
  return lessons;
}

function populateLessonSelects() {
  const lessons = getLessons();
  const selects = document.querySelectorAll('#fc-lesson-filter, #quiz-lesson-filter, #browse-lesson');
  selects.forEach(sel => {
    const current = sel.value;
    while (sel.children.length > 1) sel.removeChild(sel.lastChild);
    lessons.forEach(l => {
      const o = document.createElement('option');
      o.value = l; o.textContent = `Lesson ${l.replace('L', '')}`;
      sel.appendChild(o);
    });
    if (current) sel.value = current;
  });
}

// ── HOME ─────────────────────────────────────────────────────────────────────
function renderHome() {
  const progress = loadProgress();
  const total = WORDS_DATA.length;
  let learned = 0, mastered = 0;
  WORDS_DATA.forEach(w => {
    const s = progress[w.id]?.score || 0;
    if (s >= 3) learned++;
    if (s >= 4) mastered++;
  });
  document.getElementById('home-total').textContent = total;
  document.getElementById('home-learned').textContent = learned;
  document.getElementById('home-mastered').textContent = mastered;
  const pct = Math.round((learned / total) * 100);
  document.getElementById('home-progress-bar').style.width = pct + '%';
  document.getElementById('home-progress-label').textContent = `${pct}% complete (${learned} / ${total} learned)`;

  // Lesson grid
  const grid = document.getElementById('lesson-grid');
  grid.innerHTML = '';
  getLessons().forEach(lesson => {
    const words = WORDS_DATA.filter(w => w.lesson === lesson);
    let learnedL = 0;
    words.forEach(w => { if ((progress[w.id]?.score || 0) >= 3) learnedL++; });
    const pctL = Math.round((learnedL / words.length) * 100);
    const card = document.createElement('div');
    card.className = 'lesson-card';
    card.innerHTML = `
      <h4>Lesson ${lesson.replace('L', '')}</h4>
      <div class="lesson-count">${words.length} words · ${learnedL} learned</div>
      <div class="lesson-prog-bar"><div class="lesson-prog-fill" style="width:${pctL}%"></div></div>
      <div class="lesson-prog-label">${pctL}%</div>
    `;
    card.addEventListener('click', () => {
      document.getElementById('fc-lesson-filter').value = lesson;
      showView('flashcards');
    });
    grid.appendChild(card);
  });
}

function startFlashcards(lesson) {
  if (lesson !== 'all') document.getElementById('fc-lesson-filter').value = lesson;
  showView('flashcards');
}

function startQuiz(lesson) {
  if (lesson !== 'all') document.getElementById('quiz-lesson-filter').value = lesson;
  showView('quiz');
}

// ── FLASHCARDS ────────────────────────────────────────────────────────────────
let fcDeck = [];
let fcIndex = 0;
let fcFlipped = false;

function getFilteredWords(lessonVal, filterVal) {
  const progress = loadProgress();
  let words = WORDS_DATA;
  if (lessonVal !== 'all') words = words.filter(w => w.lesson === lessonVal);
  if (filterVal === 'unlearned') words = words.filter(w => (progress[w.id]?.score || 0) < 3);
  if (filterVal === 'review') words = words.filter(w => { const s = progress[w.id]?.score || 0; return s === 1 || s === 2; });
  return words;
}

function initFlashcards() {
  const lesson = document.getElementById('fc-lesson-filter').value;
  const filter = document.getElementById('fc-filter').value;
  fcDeck = getFilteredWords(lesson, filter);
  if (fcDeck.length === 0) fcDeck = WORDS_DATA;
  fcIndex = 0;
  renderFlashcard();
}

function renderFlashcard() {
  if (fcDeck.length === 0) return;
  const word = fcDeck[fcIndex];
  const dir = document.getElementById('fc-direction').value;

  document.getElementById('fc-card-counter').textContent = `Card ${fcIndex + 1} / ${fcDeck.length}`;
  document.getElementById('fc-progress-bar').style.width = `${((fcIndex + 1) / fcDeck.length) * 100}%`;
  document.getElementById('fc-lesson-tag').textContent = word.lesson;

  if (dir === 'de-en') {
    document.getElementById('fc-front-word').textContent = word.german;
    document.getElementById('fc-back-word').textContent = word.english;
  } else {
    document.getElementById('fc-front-word').textContent = word.english;
    document.getElementById('fc-back-word').textContent = word.german;
  }

  document.getElementById('fc-pos').textContent = word.pos;

  // Auto-speak the German word
  const germanWord = dir === 'de-en' ? word.german : word.english;
  if (dir === 'de-en') speakGerman(word.german);

  const sentDiv = document.getElementById('fc-sentences');
  sentDiv.innerHTML = word.sentences.map(s => `
    <div class="sentence">
      <div class="de">${s.de}</div>
      <div class="en">${s.en}</div>
    </div>
  `).join('');

  // Reset flip
  fcFlipped = false;
  document.getElementById('flashcard-inner').classList.remove('flipped');
  document.getElementById('fc-rating').style.display = 'none';

  // Update stats
  const stats = loadStats();
  stats.cardsReviewed++;
  saveStats(stats);
}

function flipCard() {
  if (!fcFlipped) {
    fcFlipped = true;
    document.getElementById('flashcard-inner').classList.add('flipped');
    document.getElementById('fc-rating').style.display = 'flex';
  }
}

document.getElementById('fc-prev').addEventListener('click', () => {
  if (fcIndex > 0) { fcIndex--; renderFlashcard(); }
});
document.getElementById('fc-next').addEventListener('click', () => {
  if (fcIndex < fcDeck.length - 1) { fcIndex++; renderFlashcard(); }
});

document.querySelectorAll('.rate-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const score = parseInt(btn.dataset.score);
    const word = fcDeck[fcIndex];
    const progress = loadProgress();
    progress[word.id] = { score, lastReviewed: Date.now() };
    saveProgress(progress);

    if (fcIndex < fcDeck.length - 1) {
      fcIndex++;
      renderFlashcard();
    } else {
      document.getElementById('fc-rating').style.display = 'none';
      alert(`You've reached the end of the deck! (${fcDeck.length} cards)`);
    }
  });
});

document.getElementById('fc-shuffle-btn').addEventListener('click', () => {
  fcDeck = [...fcDeck].sort(() => Math.random() - 0.5);
  fcIndex = 0;
  renderFlashcard();
});

document.getElementById('fc-lesson-filter').addEventListener('change', initFlashcards);
document.getElementById('fc-filter').addEventListener('change', initFlashcards);
document.getElementById('fc-direction').addEventListener('change', () => renderFlashcard());

// ── Text-to-Speech ────────────────────────────────────────────────────────────
function speakGerman(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'de-DE';
  utter.rate = 0.9;
  // Prefer a German voice if available
  const voices = window.speechSynthesis.getVoices();
  const germanVoice = voices.find(v => v.lang.startsWith('de'));
  if (germanVoice) utter.voice = germanVoice;
  window.speechSynthesis.speak(utter);
}

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (!document.getElementById('view-flashcards').classList.contains('active')) return;
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    if (!fcFlipped) flipCard();
    else if (fcIndex < fcDeck.length - 1) { fcIndex++; renderFlashcard(); }
  }
  if (e.key === 'ArrowLeft') { if (fcIndex > 0) { fcIndex--; renderFlashcard(); } }
  if (e.key === '1') document.querySelector('.rate-btn[data-score="1"]')?.click();
  if (e.key === '2') document.querySelector('.rate-btn[data-score="2"]')?.click();
  if (e.key === '3') document.querySelector('.rate-btn[data-score="3"]')?.click();
  if (e.key === '4') document.querySelector('.rate-btn[data-score="4"]')?.click();
});

// ── QUIZ ──────────────────────────────────────────────────────────────────────
let quizWords = [];
let quizIndex = 0;
let quizScore = 0;
let quizWrong = [];
let quizTotal = 20;

document.getElementById('start-quiz-btn').addEventListener('click', () => {
  const lesson = document.getElementById('quiz-lesson-filter').value;
  quizTotal = parseInt(document.getElementById('quiz-count').value);
  let pool = lesson === 'all' ? WORDS_DATA : WORDS_DATA.filter(w => w.lesson === lesson);
  quizWords = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(quizTotal, pool.length));
  quizIndex = 0;
  quizScore = 0;
  quizWrong = [];
  document.getElementById('quiz-setup').style.display = 'none';
  document.getElementById('quiz-active').style.display = 'block';
  document.getElementById('quiz-results').style.display = 'none';
  renderQuizQuestion();
});

function renderQuizQuestion() {
  if (quizIndex >= quizWords.length) { showQuizResults(); return; }
  const word = quizWords[quizIndex];
  const type = document.getElementById('quiz-type').value;
  const total = quizWords.length;

  document.getElementById('quiz-progress-text').textContent = `Question ${quizIndex + 1} / ${total}`;
  document.getElementById('quiz-score-text').textContent = `Score: ${quizScore}`;
  document.getElementById('quiz-progress-bar').style.width = `${(quizIndex / total) * 100}%`;
  document.getElementById('quiz-feedback').style.display = 'none';
  document.getElementById('quiz-fill').style.display = 'none';
  document.getElementById('quiz-choices').innerHTML = '';

  if (type === 'fill') {
    document.getElementById('quiz-question-label').textContent = 'Translate to German:';
    document.getElementById('quiz-question').textContent = word.english;
    document.getElementById('quiz-context').textContent = word.sentences[0]?.en || '';
    document.getElementById('quiz-fill').style.display = 'flex';
    document.getElementById('quiz-fill-input').value = '';
    document.getElementById('quiz-fill-input').className = '';
    document.getElementById('quiz-fill-input').focus();
  } else {
    // Multiple choice
    const isDeEn = type === 'de-en';
    document.getElementById('quiz-question-label').textContent = isDeEn ? 'What does this mean?' : 'Which word means:';
    document.getElementById('quiz-question').textContent = isDeEn ? word.german : word.english;
    document.getElementById('quiz-context').textContent = '';

    // Build 4 choices
    const others = WORDS_DATA.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const choices = [...others, word].sort(() => Math.random() - 0.5);

    const container = document.getElementById('quiz-choices');
    choices.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = isDeEn ? c.english : c.german;
      btn.addEventListener('click', () => handleChoice(btn, c.id === word.id, word, isDeEn ? word.english : word.german));
      container.appendChild(btn);
    });
  }
}

function handleChoice(btn, isCorrect, word, correctAnswer) {
  document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);
  const stats = loadStats();
  stats.totalAnswers++;

  if (isCorrect) {
    btn.classList.add('correct');
    quizScore++;
    stats.correctAnswers++;
    showFeedback(true, word);
  } else {
    btn.classList.add('wrong');
    // highlight correct
    document.querySelectorAll('.choice-btn').forEach(b => {
      if (b.textContent === correctAnswer) b.classList.add('correct');
    });
    quizWrong.push({ word, yourAnswer: btn.textContent });
    showFeedback(false, word);
  }
  saveStats(stats);
  updateWordScore(word.id, isCorrect);
}

document.getElementById('quiz-fill-submit').addEventListener('click', () => handleFill());
document.getElementById('quiz-fill-input').addEventListener('keydown', e => { if (e.key === 'Enter') handleFill(); });

function handleFill() {
  const input = document.getElementById('quiz-fill-input');
  const word = quizWords[quizIndex];
  const answer = input.value.trim().toLowerCase();
  const correct = word.german.toLowerCase().replace('/in', '').trim();
  const isCorrect = answer === correct || answer === word.german.toLowerCase();

  const stats = loadStats();
  stats.totalAnswers++;

  if (isCorrect) {
    input.className = 'correct';
    quizScore++;
    stats.correctAnswers++;
  } else {
    input.className = 'wrong';
    quizWrong.push({ word, yourAnswer: input.value });
  }
  saveStats(stats);
  input.disabled = true;
  document.getElementById('quiz-fill-submit').disabled = true;
  updateWordScore(word.id, isCorrect);
  showFeedback(isCorrect, word);
}

function updateWordScore(wordId, isCorrect) {
  const progress = loadProgress();
  const cur = progress[wordId]?.score || 0;
  const newScore = isCorrect ? Math.min(cur + 1, 4) : Math.max(cur - 1, 1);
  progress[wordId] = { score: newScore, lastReviewed: Date.now() };
  saveProgress(progress);
}

function showFeedback(isCorrect, word) {
  const fb = document.getElementById('quiz-feedback');
  const text = document.getElementById('feedback-text');
  fb.style.display = 'block';
  text.className = `feedback-text ${isCorrect ? 'correct-fb' : 'wrong-fb'}`;
  if (isCorrect) {
    text.innerHTML = `✓ Correct! <strong>${word.german}</strong> = ${word.english}`;
  } else {
    text.innerHTML = `✗ The correct answer was: <strong>${word.german}</strong> = ${word.english}<br><em>${word.sentences[0]?.de || ''}</em>`;
  }
}

document.getElementById('quiz-next-btn').addEventListener('click', () => {
  quizIndex++;
  document.getElementById('quiz-score-text').textContent = `Score: ${quizScore}`;
  document.getElementById('quiz-fill-input').disabled = false;
  document.getElementById('quiz-fill-submit').disabled = false;
  renderQuizQuestion();
});

function showQuizResults() {
  const stats = loadStats();
  stats.quizzes++;
  saveStats(stats);

  document.getElementById('quiz-active').style.display = 'none';
  document.getElementById('quiz-results').style.display = 'block';
  const total = quizWords.length;
  const pct = Math.round((quizScore / total) * 100);
  document.getElementById('result-percent').textContent = pct + '%';
  document.getElementById('result-fraction').textContent = `${quizScore} / ${total} correct`;

  const messages = [
    [90, '🏆 Outstanding! You really know your B1 vocab!'],
    [70, '👍 Great job! Keep practicing!'],
    [50, '📚 Good effort! Review the missed words.'],
    [0, '💪 Keep going! Practice makes perfect.'],
  ];
  const msg = messages.find(([min]) => pct >= min);
  document.getElementById('result-message').textContent = msg[1];

  if (quizWrong.length > 0) {
    const sec = document.getElementById('wrong-answers-section');
    sec.innerHTML = `<h3>Words to review (${quizWrong.length}):</h3>` +
      quizWrong.map(({ word, yourAnswer }) => `
        <div class="wrong-answer-item">
          <div class="wa-german">${word.german}</div>
          <div class="wa-english">${word.english}</div>
          <div class="wa-your">Your answer: ${yourAnswer}</div>
        </div>
      `).join('');
  } else {
    document.getElementById('wrong-answers-section').innerHTML = '<p style="color:var(--green)">Perfect score! 🎉</p>';
  }
}

function restartQuiz() {
  document.getElementById('quiz-setup').style.display = 'block';
  document.getElementById('quiz-active').style.display = 'none';
  document.getElementById('quiz-results').style.display = 'none';
}

// ── BROWSE ────────────────────────────────────────────────────────────────────
function renderBrowse() {
  const search = document.getElementById('browse-search').value.toLowerCase();
  const lesson = document.getElementById('browse-lesson').value;
  const status = document.getElementById('browse-status').value;
  const progress = loadProgress();

  let words = WORDS_DATA;
  if (search) words = words.filter(w => w.german.toLowerCase().includes(search) || w.english.toLowerCase().includes(search));
  if (lesson !== 'all') words = words.filter(w => w.lesson === lesson);
  if (status !== 'all') words = words.filter(w => getStatus(progress[w.id]?.score || 0) === status);

  document.getElementById('browse-count').textContent = `Showing ${words.length} of ${WORDS_DATA.length} words`;

  const list = document.getElementById('word-list');
  list.innerHTML = '';
  words.forEach(word => {
    const score = progress[word.id]?.score || 0;
    const s = getStatus(score);
    const card = document.createElement('div');
    card.className = 'word-card';
    card.innerHTML = `
      <div class="word-card-header">
        <span class="word-card-german">${word.german}</span>
        <span class="word-card-tag">${word.lesson}</span>
      </div>
      <div class="word-card-english">${word.english}</div>
      <div class="word-status-dot ${s}" title="${s}"></div>
    `;
    card.addEventListener('click', () => openWordModal(word));
    list.appendChild(card);
  });
}

document.getElementById('browse-search').addEventListener('input', renderBrowse);
document.getElementById('browse-lesson').addEventListener('change', renderBrowse);
document.getElementById('browse-status').addEventListener('change', renderBrowse);

function openWordModal(word) {
  const progress = loadProgress();
  const score = progress[word.id]?.score || 0;
  const status = getStatus(score);

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
  overlay.querySelector('#modal-close-btn').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelectorAll('.mark-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = loadProgress();
      p[word.id] = { score: parseInt(btn.dataset.score), lastReviewed: Date.now() };
      saveProgress(p);
      overlay.remove();
      renderBrowse();
    });
  });
}

// ── STATS ─────────────────────────────────────────────────────────────────────
function renderStats() {
  const progress = loadProgress();
  const stats = loadStats();
  let mastered = 0, learning = 0, newCount = 0;

  WORDS_DATA.forEach(w => {
    const s = getStatus(progress[w.id]?.score || 0);
    if (s === 'mastered') mastered++;
    else if (s === 'learning') learning++;
    else newCount++;
  });

  const total = WORDS_DATA.length;
  document.getElementById('stats-total').textContent = total;
  document.getElementById('stats-mastered').textContent = mastered;
  document.getElementById('stats-learning').textContent = learning;
  document.getElementById('stats-new').textContent = newCount;

  const pct = Math.round(((mastered + learning) / total) * 100);
  document.getElementById('stats-big-progress').style.width = pct + '%';
  document.getElementById('stats-progress-label').textContent = `${pct}% started · ${Math.round((mastered / total) * 100)}% mastered`;

  // Lesson breakdown
  const lessonStats = document.getElementById('lesson-stats');
  lessonStats.innerHTML = '<h3>Progress by Lesson</h3>';
  getLessons().forEach(lesson => {
    const words = WORDS_DATA.filter(w => w.lesson === lesson);
    let done = 0;
    words.forEach(w => { if ((progress[w.id]?.score || 0) >= 3) done++; });
    const pctL = Math.round((done / words.length) * 100);
    lessonStats.innerHTML += `
      <div class="lesson-stat-row">
        <span class="lesson-stat-name">${lesson}</span>
        <div class="lesson-stat-bar-wrap"><div class="lesson-stat-fill" style="width:${pctL}%"></div></div>
        <span class="lesson-stat-pct">${pctL}%</span>
      </div>
    `;
  });

  document.getElementById('stats-quizzes').textContent = stats.quizzes;
  document.getElementById('stats-cards-seen').textContent = stats.cardsReviewed;
  const acc = stats.totalAnswers > 0 ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) + '%' : 'N/A';
  document.getElementById('stats-correct-rate').textContent = acc;
}

document.getElementById('reset-progress-btn').addEventListener('click', () => {
  if (confirm('Reset all progress? This cannot be undone.')) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STATS_KEY);
    renderStats();
    alert('Progress reset.');
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────
populateLessonSelects();
renderHome();
initFlashcards();
