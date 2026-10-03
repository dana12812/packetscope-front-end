import { Link, useLocation } from 'react-router';
import { Logo } from '../Sidebar/Sidebar';

// Top navigation for signed-out visitors (signed-in users get the sidebar instead)
const NavBar = () => {
  const { pathname } = useLocation()
  const onLanding = pathname === '/'

  return (
    <nav className={`public-nav ${onLanding ? 'is-dark' : ''}`}>
      <ul>
        <li className="nav-brand"><Link to="/" aria-label="PacketScope home"><Logo /></Link></li>
        {onLanding && <li className="nav-section"><a href="#features">Features</a></li>}
        {onLanding && <li className="nav-section"><a href="#how-it-works">How it works</a></li>}
        <li><Link to='/sign-in'>Sign In</Link></li>
        <li><Link className="nav-cta" to='/sign-up'>Get Started</Link></li>
      </ul>
    </nav>
  );
};

export default NavBar;
