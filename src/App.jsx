import { HashRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Learn from './pages/Learn';
import Learned from './pages/Learned';
import All from './pages/All';
import Settings from './pages/Settings';
import { useProgress } from './hooks/useProgress';
import { useSettings } from './hooks/useSettings';
import { getWords, getWordsAsync } from './data/index';

export default function App() {
  const { progress, isLearned, markLearned, markNew, reset, user, signIn, signOut } = useProgress();
  const { settings, setLevels } = useSettings();
  const [words, setWords] = useState(() => getWords(settings.levels));

  // Load B2 data lazily when levels include B2
  useEffect(() => {
    let active = true;
    getWordsAsync(settings.levels).then(w => {
      if (active) setWords(prev => prev === w ? prev : w);
    });
    return () => { active = false; };
  }, [settings.levels]);

  const props = { words, progress, isLearned, markLearned, markNew };

  return (
    <HashRouter>
      <Header user={user} onSignIn={signIn} onSignOut={signOut} levels={settings.levels} />
      <main>
        <Routes>
          <Route path="/" element={<Learn {...props} reset={reset} />} />
          <Route path="/learned" element={<Learned isLearned={isLearned} markLearned={markLearned} markNew={markNew} progress={progress} />} />
          <Route path="/all" element={<All {...props} />} />
          <Route path="/settings" element={<Settings settings={settings} setLevels={setLevels} />} />
        </Routes>
      </main>
    </HashRouter>
  );
}
