import { NavLink } from 'react-router-dom';

export default function Header({ user, onSignIn, onSignOut }) {
  return (
    <header>
      <div className="header-inner">
        <nav>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-btn active' : 'nav-btn'}>Learn</NavLink>
          <NavLink to="/learned" className={({ isActive }) => isActive ? 'nav-btn active' : 'nav-btn'}>Learned</NavLink>
          <NavLink to="/all" className={({ isActive }) => isActive ? 'nav-btn active' : 'nav-btn'}>All</NavLink>
        </nav>
        <div className="auth-area">
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
