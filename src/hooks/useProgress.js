import { useState, useEffect, useCallback, useRef } from 'react';
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, doc, getDoc, setDoc } from '../lib/firebase';

const KEY = 'b1vocab_progress';

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? {}; } catch { return {}; }
}
function saveLocal(p) { localStorage.setItem(KEY, JSON.stringify(p)); }

export function useProgress() {
  const [progress, setProgress] = useState(loadLocal);
  const [user, setUser] = useState(null);
  const syncTimer = useRef(null);

  // Auth listener
  useEffect(() => {
    return onAuthStateChanged(auth, async u => {
      setUser(u);
      if (u) {
        const changed = await mergeCloud(u.uid, progress);
        if (changed) setProgress(loadLocal());
      }
    });
  }, []);

  async function mergeCloud(uid, local) {
    try {
      const ref = doc(db, 'users', uid, 'data', 'progress');
      const snap = await getDoc(ref);
      if (!snap.exists()) { await setDoc(ref, local); return false; }
      const cloud = snap.data() ?? {};
      const merged = { ...local };
      let changed = false;
      Object.entries(cloud).forEach(([id, data]) => {
        if ((data.score ?? 0) > (local[id]?.score ?? 0)) { merged[id] = data; changed = true; }
      });
      if (changed) { saveLocal(merged); await setDoc(ref, merged); }
      return changed;
    } catch { return false; }
  }

  function scheduleSyncCloud(p, uid) {
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      try { await setDoc(doc(db, 'users', uid, 'data', 'progress'), p); } catch {}
    }, 1500);
  }

  const save = useCallback((p) => {
    saveLocal(p);
    setProgress(p);
    if (user) scheduleSyncCloud(p, user.uid);
  }, [user]);

  const markLearned = useCallback((wordId) => {
    const p = { ...loadLocal(), [wordId]: { score: 3, lastReviewed: Date.now() } };
    save(p);
  }, [save]);

  const markNew = useCallback((wordId) => {
    const p = { ...loadLocal() };
    delete p[wordId];
    save(p);
  }, [save]);

  const isLearned = useCallback((wordId) => (progress[wordId]?.score ?? 0) >= 3, [progress]);

  const reset = useCallback(() => {
    localStorage.removeItem(KEY);
    save({});
  }, [save]);

  const signIn = () => signInWithPopup(auth, googleProvider).catch(console.error);
  const signOutFn = () => signOut(auth);

  return { progress, isLearned, markLearned, markNew, reset, user, signIn, signOut: signOutFn };
}
