import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Header({ user, onSignIn, onSignOut, levels = ['B1'] }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (!menuRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const cls = ({ isActive }) => isActive ? 'nav-btn active' : 'nav-btn';

  return (
    <header>
      <div className="header-inner">
        <nav>
          <NavLink to="/" end className={cls}>Learn</NavLink>
          <NavLink to="/learned" className={cls}>Learned</NavLink>
          <NavLink to="/all" className={cls}>All</NavLink>
        </nav>

        <div className="menu-wrap" ref={menuRef}>
          <button
            className={`menu-trigger${open ? ' open' : ''}`}
            onClick={() => setOpen(o => !o)}
            aria-label="Menu"
          >
            <span className="level-badge">{levels.join('+')}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 10.5L2.5 5h11L8 10.5z"/>
            </svg>
          </button>

          {open && (
            <div className="dropdown">
              <button className="dropdown-item" onClick={() => { navigate('/settings'); setOpen(false); }}>
                <span className="icon">⚙</span> Settings
              </button>
              <div className="dropdown-divider" />
              {user
                ? <button className="dropdown-item" onClick={() => { onSignOut(); setOpen(false); }}>Sign out</button>
                : <button className="dropdown-item" onClick={() => { onSignIn(); setOpen(false); }}>Sync progress</button>
              }
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
