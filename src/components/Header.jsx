import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const ALL_LEVELS = ['A1', 'A2', 'B1', 'B2'];

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

export default function Header({ user, onSignIn, onSignOut, levels = ['B1'], setLevels }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const cls = ({ isActive }) => isActive ? 'nav-btn active' : 'nav-btn';

  useEffect(() => {
    function handler(e) {
      if (!menuRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function toggleLevel(level) {
    if (levels.includes(level)) {
      if (levels.length === 1) return;
      setLevels(levels.filter(l => l !== level));
    } else {
      setLevels([...levels, level]);
    }
  }

  return (
    <header>
      <div className="header-inner">
        <nav>
          <NavLink to="/" end className={cls}>New</NavLink>
          <NavLink to="/all" className={cls}>All</NavLink>
        </nav>

        <div className="header-right">
          <div className="header-levels">
            {ALL_LEVELS.map(level => (
              <button
                key={level}
                className={`header-level-btn${levels.includes(level) ? ' active' : ''}`}
                onClick={() => toggleLevel(level)}
              >
                {level}
              </button>
            ))}
          </div>

          {user ? (
            <div className="avatar-wrap" ref={menuRef}>
              <button className="avatar-btn" onClick={() => setOpen(o => !o)} aria-label="Account">
                {initials(user.displayName)}
              </button>
              {open && (
                <div className="avatar-dropdown">
                  <div className="avatar-dropdown-name">{user.displayName ?? user.email}</div>
                  <div className="avatar-dropdown-divider" />
                  <button className="avatar-dropdown-item" onClick={() => { onSignOut(); setOpen(false); }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="auth-btn" onClick={onSignIn}>Login</button>
          )}
        </div>
      </div>
    </header>
  );
}
