// Firebase — optional progress sync
// Words and studying are always public (no login needed).
// Sign in only to sync progress across devices.

const firebaseConfig = {
  apiKey: "AIzaSyBP9-GpWLGdZrfyy_2rPKhMszplK9GEUbA",
  authDomain: "b1-vocabulary.firebaseapp.com",
  projectId: "b1-vocabulary",
  storageBucket: "b1-vocabulary.firebasestorage.app",
  messagingSenderId: "133009018636",
  appId: "1:133009018636:web:7098507e73ba4c378f4329"
};

firebase.initializeApp(firebaseConfig);
const fbAuth = firebase.auth();
const fbDb = firebase.firestore();

let fbUser = null;
let cloudSyncTimer = null;

// ── Auth UI ──────────────────────────────────────────────────────────────────
function updateAuthUI(user) {
  const btn = document.getElementById('auth-btn');
  if (user) {
    btn.textContent = 'Sign out';
    btn.classList.add('signed-in');
  } else {
    btn.textContent = 'Sync';
    btn.classList.remove('signed-in');
  }
}

document.getElementById('auth-btn').addEventListener('click', () => {
  if (fbUser) {
    fbAuth.signOut();
  } else {
    const provider = new firebase.auth.GoogleAuthProvider();
    fbAuth.signInWithPopup(provider).catch(err => {
      console.error('Sign-in error:', err);
      showSyncStatus('Sign-in failed. Try again.');
    });
  }
});

// ── Auth state ───────────────────────────────────────────────────────────────
fbAuth.onAuthStateChanged(async user => {
  fbUser = user;
  updateAuthUI(user);

  if (user) {
    showSyncStatus('Syncing progress...');
    const changed = await mergeCloudProgress(user.uid);
    showSyncStatus('Progress synced ✓', 2000);
    // Only re-render if cloud had newer data — avoids word flicker on load
    if (changed && typeof renderHome === 'function') renderHome();
  }
});

// ── Cloud read: merge cloud data into local (take best score per word) ───────
async function mergeCloudProgress(uid) {
  try {
    const doc = await fbDb.collection('users').doc(uid).collection('data').doc('progress').get();
    if (!doc.exists) {
      await pushLocalToCloud(uid);
      return false; // nothing changed locally
    }
    const cloud = doc.data() || {};
    const local = loadLocalProgress();
    const merged = { ...local };
    let changed = false;

    Object.entries(cloud).forEach(([id, data]) => {
      const localScore = local[id]?.score || 0;
      if ((data.score || 0) > localScore) { merged[id] = data; changed = true; }
    });

    if (changed) {
      saveLocalProgress(merged);
      await fbDb.collection('users').doc(uid).collection('data').doc('progress').set(merged);
    }
    return changed;
  } catch (err) {
    console.error('Merge error:', err);
    return false;
  }
}

async function pushLocalToCloud(uid) {
  const local = loadLocalProgress();
  if (Object.keys(local).length === 0) return;
  try {
    await fbDb.collection('users').doc(uid).collection('data').doc('progress').set(local);
  } catch (err) {
    console.error('Push error:', err);
  }
}

// ── Cloud write: debounced so rapid card flips don't spam Firestore ──────────
function scheduleSyncToCloud(progress) {
  if (!fbUser) return;
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(async () => {
    try {
      await fbDb.collection('users').doc(fbUser.uid).collection('data').doc('progress').set(progress);
    } catch (err) {
      console.error('Cloud save error:', err);
    }
  }, 1500);
}

// ── Toast helper ─────────────────────────────────────────────────────────────
let statusEl = null;
let statusHideTimer = null;

function showSyncStatus(msg, hideAfter = 0) {
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.className = 'sync-status';
    document.body.appendChild(statusEl);
  }
  statusEl.textContent = msg;
  statusEl.style.display = 'block';
  clearTimeout(statusHideTimer);
  if (hideAfter > 0) {
    statusHideTimer = setTimeout(() => { statusEl.style.display = 'none'; }, hideAfter);
  }
}

// ── Expose helpers used by app.js ────────────────────────────────────────────
function loadLocalProgress() {
  try { return JSON.parse(localStorage.getItem('b1vocab_progress')) || {}; } catch { return {}; }
}

function saveLocalProgress(p) {
  localStorage.setItem('b1vocab_progress', JSON.stringify(p));
  scheduleSyncToCloud(p);
}
