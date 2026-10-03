import { useContext } from 'react';
import { NavLink, Link, useLocation } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import Icon from '../Icon/Icon';

export const Logo = () => (
  <span className="logo">
    <svg className="logo-mark" viewBox="0 0 32 36" aria-hidden="true" focusable="false">
      <path d="M16 1.5 29 6.5v11c0 8.4-5.6 14.6-13 17-7.4-2.4-13-8.6-13-17v-11z" fill="#102A5C" />
      <path d="M16 5.2 25.6 9v8.4c0 6.4-4 11.3-9.6 13.4z" fill="#6C5CE7" />
      <path d="M7.5 18.5h4l2-4.5 3.5 9 2.2-4.5h5.3" fill="none" stroke="#16C7C7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className="logo-text">Packet<span>Scope</span></span>
  </span>
);

// Only links to pages that exist: everything else lives on the dashboard.
const Sidebar = ({ open, onClose }) => {
  const { pathname, search, hash, state } = useLocation();
  // Captures opened from the admin pages keep "Admin" highlighted
  const viaAdmin = Boolean(state?.fromAdmin);
  const { user } = useContext(UserContext);
  const onDashboard = pathname === '/';
  const viewingAll = onDashboard && new URLSearchParams(search).get('view') === 'all';

  const items = [
    { to: '/', label: 'Dashboard', icon: 'home', active: onDashboard && !viewingAll && hash !== '#upload' },
    { to: '/?view=all#analyses', label: 'My Analyses', icon: 'fileText', active: viewingAll || (pathname.startsWith('/captures') && !viaAdmin) },
    { to: '/#upload', label: 'Upload Capture', icon: 'cloudUpload', active: onDashboard && hash === '#upload' },
    { to: '/tags', label: 'Tags', icon: 'tag', active: pathname === '/tags' },
  ];
  if (user?.role === 'admin') {
    items.push({ to: '/admin', label: 'Admin', icon: 'shield', active: pathname.startsWith('/admin') || (pathname.startsWith('/captures') && viaAdmin) });
  }

  return (
    <>
      <div className={`sidebar-scrim ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'is-open' : ''}`} id="sidebar" aria-label="Main navigation">
        <div className="sidebar-top">
          <Link to="/" className="sidebar-logo" onClick={onClose} aria-label="PacketScope home">
            <Logo />
          </Link>
          <button className="icon-btn sidebar-close" type="button" onClick={onClose} aria-label="Close menu">
            <Icon name="x" />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {items.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  className={() => `side-link ${item.active ? 'is-active' : ''}`}
                  aria-current={item.active ? 'page' : undefined}
                  onClick={onClose}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <svg className="sidebar-waves" viewBox="0 0 260 220" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 90C60 40 120 130 180 80S260 60 260 60V220H0z" fill="#DDF4FF" />
          <path d="M0 140C70 100 130 170 200 120S260 110 260 110V220H0z" fill="#E9E5FF" />
        </svg>
      </aside>
    </>
  );
};

export default Sidebar;
