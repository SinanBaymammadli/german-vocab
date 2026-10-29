import { useState, useEffect } from "react";
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc } from "../lib/firebase";

const KEY = "b1vocab_settings";
const DEFAULT = { levels: ["B1"] };

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(loadLocal);

  function saveLocal(s) {
    localStorage.setItem(KEY, JSON.stringify(s));
    setSettings(s);
  }

  async function saveCloud(uid, s) {
    try {
      await setDoc(doc(db, "users", uid, "data", "settings"), s);
    } catch {}
  }

  // On sign-in, load settings from Firestore and merge (cloud wins)
  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid, "data", "settings"));
        if (snap.exists()) {
          const cloud = snap.data();
          // Only update if levels actually differ from local
          const local = loadLocal();
          const same =
            JSON.stringify([...(local.levels ?? [])].sort()) ===
            JSON.stringify([...(cloud.levels ?? [])].sort());
          if (!same) saveLocal(cloud);
        } else {
          // First sign-in: push local settings to cloud
          await saveCloud(user.uid, loadLocal());
        }
      } catch {}
    });
  }, []);

  function setLevels(levels) {
    if (!levels || levels.length === 0) return;
    const s = { ...settings, levels };
    saveLocal(s);
    auth.currentUser && saveCloud(auth.currentUser.uid, s);
  }

  return { settings, setLevels };
}
