import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Learn from './pages/Learn';
import Learned from './pages/Learned';
import All from './pages/All';
import Settings from './pages/Settings';
import { useProgress } from './hooks/useProgress';
import { useSettings } from './hooks/useSettings';
import { getWordsAsync } from './data/index';

export default function App() {
  const { progress, isLearned, markLearned, markNew, reset, user, signIn, signOut } = useProgress();
  const { settings, setLevels } = useSettings();

  const [words, setWords] = useState(null);      // null = loading
  const [wordsKey, setWordsKey] = useState('');  // changes when words actually load

  useEffect(() => {
    let active = true;
    setWords(null); // show loading while switching levels
    getWordsAsync(settings.levels).then(w => {
      if (!active) return;
      setWords(w);
      setWordsKey(settings.levels.slice().sort().join('+'));
    });
    return () => { active = false; };
  }, [settings.levels]);

  const props = { words: words ?? [], progress, isLearned, markLearned, markNew };

  return (
    <BrowserRouter basename="/german-vocab">
      <Header user={user} onSignIn={signIn} onSignOut={signOut} levels={settings.levels} />
      <main>
        {words === null
          ? <div className="loading">Loading words…</div>
          : (
          <Routes>
            <Route path="/" element={<Learn key={wordsKey} {...props} reset={reset} />} />
            <Route path="/learned" element={<Learned isLearned={isLearned} markLearned={markLearned} markNew={markNew} progress={progress} />} />
            <Route path="/all" element={<All {...props} />} />
            <Route path="/settings" element={<Settings settings={settings} setLevels={setLevels} />} />
          </Routes>
        )}
      </main>
    </BrowserRouter>
  );
}
