import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import { removeToken } from '../../lib/helpers/jwt-helpers';
import Icon from '../Icon/Icon';

const TopHeader = ({ onOpenMenu }) => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (evt) => {
      if (evt.type === 'keydown' && evt.key !== 'Escape') return;
      if (evt.type === 'mousedown' && menuRef.current?.contains(evt.target)) return;
      setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [menuOpen]);

  const handleSignOut = () => {
    removeToken();
    setUser(null);
    navigate('/');
  };

  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" type="button" onClick={onOpenMenu} aria-label="Open menu" aria-controls="sidebar">
        <Icon name="menu" />
      </button>

      {/* key resets the box when the URL query changes elsewhere (e.g. "Clear search") */}
      <SearchForm key={searchParams.get('q') || ''} initial={searchParams.get('q') || ''} />

      <div className="user-menu" ref={menuRef}>
        <button
          className="user-btn"
          type="button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="avatar" aria-hidden="true">{user.username.charAt(0).toUpperCase()}</span>
          <span className="user-name">{user.username}</span>
          <Icon name="chevronDown" size={16} />
        </button>
        {menuOpen && (
          <div className="user-dropdown" role="menu">
            <p className="user-dropdown-meta">Signed in as <strong>{user.username}</strong></p>
            <button type="button" role="menuitem" className="user-dropdown-item" onClick={handleSignOut}>
              <Icon name="logOut" size={18} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

// Search filters the user's captures on the dashboard
const SearchForm = ({ initial }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initial);

  const handleSearch = (evt) => {
    evt.preventDefault();
    const q = query.trim();
    navigate(q ? `/?view=all&q=${encodeURIComponent(q)}#analyses` : '/');
  };

  return (
    <form className="search" role="search" onSubmit={handleSearch}>
      <Icon name="search" size={18} />
      <label htmlFor="global-search" className="sr-only">Search captures</label>
      <input
        id="global-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search files or tags…"
      />
    </form>
  );
};

export default TopHeader;
