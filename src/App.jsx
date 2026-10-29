import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Learn from './pages/Learn';
import All from './pages/All';
import { useProgress } from './hooks/useProgress';
import { useSettings } from './hooks/useSettings';
import { getWordsAsync } from './data/index';

export default function App() {
  const { progress, isLearned, isSeen, markLearned, markNew, markSeen, reset, user, signIn, signOut } = useProgress();
  const { settings, setLevels } = useSettings();

  const [words, setWords] = useState(null);
  const [wordsKey, setWordsKey] = useState('');

  useEffect(() => {
    let active = true;
    setWords(null);
    getWordsAsync(settings.levels).then(w => {
      if (!active) return;
      setWords(w);
      setWordsKey(settings.levels.slice().sort().join('+'));
    });
    return () => { active = false; };
  }, [settings.levels]);

  const props = { words: words ?? [], progress, isLearned, isSeen, markLearned, markNew, markSeen };

  return (
    <BrowserRouter basename="/german-vocab">
      <Header user={user} onSignIn={signIn} onSignOut={signOut} levels={settings.levels} setLevels={setLevels} />
      <main>
        {words === null
          ? <div className="loading">Loading words…</div>
          : (
          <Routes>
            <Route path="/" element={<Learn key={wordsKey} {...props} reset={reset} />} />
            <Route path="/all" element={<All {...props} />} />
          </Routes>
        )}
      </main>
    </BrowserRouter>
  );
}
