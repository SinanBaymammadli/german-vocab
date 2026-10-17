import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Learn from './pages/Learn';
import Learned from './pages/Learned';
import All from './pages/All';
import { useProgress } from './hooks/useProgress';

export default function App() {
  const { progress, isLearned, markLearned, markNew, reset, user, signIn, signOut } = useProgress();

  const props = { progress, isLearned, markLearned, markNew };

  return (
    <HashRouter>
      <Header user={user} onSignIn={signIn} onSignOut={signOut} />
      <main>
        <Routes>
          <Route path="/" element={<Learn {...props} reset={reset} />} />
          <Route path="/learned" element={<Learned {...props} />} />
          <Route path="/all" element={<All {...props} />} />
        </Routes>
      </main>
    </HashRouter>
  );
}
