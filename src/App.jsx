import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Learn from './pages/Learn';
import Learned from './pages/Learned';
import All from './pages/All';
import Settings from './pages/Settings';
import { useProgress } from './hooks/useProgress';
import { useSettings } from './hooks/useSettings';
import { getWords } from './data/index';

export default function App() {
  const { progress, isLearned, markLearned, markNew, reset, user, signIn, signOut } = useProgress();
  const { settings, setLevels } = useSettings();
  const words = getWords(settings.levels);

  const props = { words, progress, isLearned, markLearned, markNew };

  return (
    <HashRouter>
      <Header user={user} onSignIn={signIn} onSignOut={signOut} levels={settings.levels} />
      <main>
        <Routes>
          <Route path="/" element={<Learn {...props} reset={reset} />} />
          <Route path="/learned" element={<Learned {...props} />} />
          <Route path="/all" element={<All {...props} />} />
          <Route path="/settings" element={<Settings settings={settings} setLevels={setLevels} />} />
        </Routes>
      </main>
    </HashRouter>
  );
}
