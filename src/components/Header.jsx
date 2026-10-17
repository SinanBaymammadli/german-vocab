import { NavLink } from 'react-router-dom';

export default function Header({ user, onSignIn, onSignOut, levels = ['B1'] }) {
  const cls = ({ isActive }) => isActive ? 'nav-btn active' : 'nav-btn';
  return (
    <header>
      <div className="header-inner">
        <nav>
          <NavLink to="/" end className={cls}>Learn</NavLink>
          <NavLink to="/learned" className={cls}>Learned</NavLink>
          <NavLink to="/all" className={cls}>All</NavLink>
          <NavLink to="/settings" className={cls}>⚙</NavLink>
        </nav>
        <div className="auth-area">
          <span className="level-badge">{levels.join('+')}</span>
          <button
            className={`btn sync-btn${user ? ' signed-in' : ''}`}
            onClick={user ? onSignOut : onSignIn}
          >
            {user ? 'Sign out' : 'Sync'}
          </button>
        </div>
      </div>
    </header>
  );
}
